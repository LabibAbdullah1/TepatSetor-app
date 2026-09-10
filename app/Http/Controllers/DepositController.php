<?php

namespace App\Http\Controllers;

use App\Helpers\QrCodeHelper;
use App\Http\Requests\StoreDepositRequest;
use App\Http\Requests\UpdateDepositRequest;
use App\Models\Deposit;
use App\Models\DepositCategory;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Encoders\JpegEncoder;

class DepositController extends Controller
{
    /**
     * Display a listing of the resource (Dashboard).
     */
    public function index()
    {
        $deposits = Deposit::with(['details', 'bankAccount', 'categories'])
            ->orderBy('deposit_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard', [
            'deposits' => $deposits,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('DepositForm', [
            'deposit' => null,
            'bankAccounts' => request()->user()->bankAccounts()->orderBy('bank_name')->get(),
            'defaultSigners' => request()->user()->default_signers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDepositRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                // Calculate grand total on backend to ensure math and security integrity
                $grandTotal = 0;
                $detailsData = [];
                foreach ($request->input('details') as $detail) {
                    $qty = intval($detail['quantity']);
                    $denom = intval($detail['denomination']);
                    $subtotal = $qty * $denom;
                    $grandTotal += $subtotal;

                    $detailsData[] = [
                        'denomination' => $denom,
                        'quantity' => $qty,
                        'subtotal' => $subtotal,
                    ];
                }

                // Process signers array (filter empty entries)
                $rawSigners = $request->input('signers', []);
                $signers = [];
                if (is_array($rawSigners)) {
                    foreach ($rawSigners as $signer) {
                        $name = trim($signer['name'] ?? '');
                        $title = trim($signer['title'] ?? '');
                        if (!empty($name) || !empty($title)) {
                            $signers[] = [
                                'name' => $name,
                                'title' => $title,
                            ];
                        }
                    }
                }

                // Compare with user profile default_signers. If identical to default, store NULL so it remains dynamic to future Profile updates!
                $userDefault = $request->user()->default_signers;
                $signersToSave = $this->isSameSigners($signers, $userDefault)
                    ? null
                    : (count($signers) > 0 ? array_values($signers) : null);

                $proofImagePath = null;
                if ($request->hasFile('proof_image')) {
                    $file = $request->file('proof_image');
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                    if (strtolower($file->getClientOriginalExtension()) === 'pdf') {
                        Storage::putFileAs('private/deposits', $file, $filename);
                    } else {
                        $manager = new ImageManager(new Driver());
                        $image = $manager->decode($file);
                        
                        if ($image->width() > 1200) {
                            $image->scale(width: 1200);
                        }

                        $extension = strtolower($file->getClientOriginalExtension());
                        $encoded = ($extension === 'png') 
                            ? $image->encode(new PngEncoder()) 
                            : $image->encode(new JpegEncoder(75));
                        
                        Storage::put('private/deposits/' . $filename, (string)$encoded);
                    }
                    $proofImagePath = 'private/deposits/' . $filename;
                }

                $deposit = Deposit::create([
                    'deposit_date' => $request->input('deposit_date'),
                    'notes' => $request->input('notes'),
                    'signers' => $signersToSave,
                    'grand_total' => $grandTotal,
                    'status' => $request->input('status'),
                    'proof_image_path' => $proofImagePath,
                    'bank_account_id' => $request->input('bank_account_id'),
                ]);

                foreach ($detailsData as $detail) {
                    $deposit->details()->create($detail);
                }

                // Store categories breakdown if present
                $rawCategories = $request->input('categories', []);
                if (is_array($rawCategories)) {
                    foreach ($rawCategories as $cat) {
                        $catName = trim($cat['category_name'] ?? '');
                        $amount = floatval($cat['amount'] ?? 0);
                        if (!empty($catName) && $amount > 0) {
                            $deposit->categories()->create([
                                'category_name' => $catName,
                                'amount' => $amount,
                            ]);
                        }
                    }
                }
            });

            return redirect()->route('dashboard')->with('success', 'Laporan setoran berhasil dibuat.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Gagal menyimpan setoran: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($uuid)
    {
        $deposit = Deposit::with(['details', 'categories'])->where('uuid', $uuid)->firstOrFail();
        $bankAccounts = request()->user()->bankAccounts()->orderBy('bank_name')->get();

        return Inertia::render('DepositForm', [
            'deposit' => $deposit,
            'bankAccounts' => $bankAccounts,
            'defaultSigners' => request()->user()->default_signers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDepositRequest $request, $uuid)
    {
        try {
            DB::transaction(function () use ($request, $uuid) {
                $deposit = Deposit::where('uuid', $uuid)->firstOrFail();

                // Delete any old generated PDF for this deposit so files don't accumulate
                $this->cleanupPdfStorage($deposit->uuid);

                // Calculate grand total
                $grandTotal = 0;
                $detailsData = [];
                foreach ($request->input('details') as $detail) {
                    $qty = intval($detail['quantity']);
                    $denom = intval($detail['denomination']);
                    $subtotal = $qty * $denom;
                    $grandTotal += $subtotal;

                    $detailsData[] = [
                        'denomination' => $denom,
                        'quantity' => $qty,
                        'subtotal' => $subtotal,
                    ];
                }

                // Process signers array
                $rawSigners = $request->input('signers', []);
                $signers = [];
                if (is_array($rawSigners)) {
                    foreach ($rawSigners as $signer) {
                        $name = trim($signer['name'] ?? '');
                        $title = trim($signer['title'] ?? '');
                        if (!empty($name) || !empty($title)) {
                            $signers[] = [
                                'name' => $name,
                                'title' => $title,
                            ];
                        }
                    }
                }

                // Compare with user profile default_signers. If identical to default, store NULL so it remains dynamic to future Profile updates!
                $userDefault = $request->user()->default_signers;
                $signersToSave = $this->isSameSigners($signers, $userDefault)
                    ? null
                    : (count($signers) > 0 ? array_values($signers) : null);

                $proofImagePath = $deposit->proof_image_path;
                if ($request->hasFile('proof_image')) {
                    // Delete old file
                    if ($proofImagePath && Storage::exists($proofImagePath)) {
                        Storage::delete($proofImagePath);
                    }

                    $file = $request->file('proof_image');
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                    if (strtolower($file->getClientOriginalExtension()) === 'pdf') {
                        Storage::putFileAs('private/deposits', $file, $filename);
                    } else {
                        $manager = new ImageManager(new Driver());
                        $image = $manager->decode($file);
                        
                        if ($image->width() > 1200) {
                            $image->scale(width: 1200);
                        }

                        $extension = strtolower($file->getClientOriginalExtension());
                        $encoded = ($extension === 'png') 
                            ? $image->encode(new PngEncoder()) 
                            : $image->encode(new JpegEncoder(75));
                        
                        Storage::put('private/deposits/' . $filename, (string)$encoded);
                    }
                    $proofImagePath = 'private/deposits/' . $filename;
                }

                $deposit->update([
                    'deposit_date' => $request->input('deposit_date'),
                    'notes' => $request->input('notes'),
                    'signers' => $signersToSave,
                    'grand_total' => $grandTotal,
                    'status' => $request->input('status'),
                    'proof_image_path' => $proofImagePath,
                    'bank_account_id' => $request->input('bank_account_id'),
                ]);

                // Sync details by deleting and recreating
                $deposit->details()->delete();
                foreach ($detailsData as $detail) {
                    $deposit->details()->create($detail);
                }

                // Sync categories
                $deposit->categories()->delete();
                $rawCategories = $request->input('categories', []);
                if (is_array($rawCategories)) {
                    foreach ($rawCategories as $cat) {
                        $catName = trim($cat['category_name'] ?? '');
                        $amount = floatval($cat['amount'] ?? 0);
                        if (!empty($catName) && $amount > 0) {
                            $deposit->categories()->create([
                                'category_name' => $catName,
                                'amount' => $amount,
                            ]);
                        }
                    }
                }
            });

            return redirect()->route('dashboard')->with('success', 'Laporan setoran berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Gagal memperbarui setoran: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($uuid)
    {
        try {
            DB::transaction(function () use ($uuid) {
                $deposit = Deposit::where('uuid', $uuid)->firstOrFail();

                if ($deposit->proof_image_path && Storage::exists($deposit->proof_image_path)) {
                    Storage::delete($deposit->proof_image_path);
                }

                // Delete any generated PDF file stored for this deposit
                $this->cleanupPdfStorage($uuid);

                $deposit->delete(); // Cascading delete will handle details & categories
            });

            return redirect()->route('dashboard')->with('success', 'Laporan setoran berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus setoran: ' . $e->getMessage());
        }
    }

    /**
     * Serve the proof image securely.
     */
    public function serveProof($uuid)
    {
        $deposit = Deposit::where('uuid', $uuid)->firstOrFail();

        if (!$deposit->proof_image_path || !Storage::exists($deposit->proof_image_path)) {
            abort(404);
        }

        return Storage::response($deposit->proof_image_path);
    }

    /**
     * Generate PDF report with dynamic versioned QR verification stamp and auto-cleanup old files.
     */
    public function generatePdf($uuid)
    {
        $deposit = Deposit::with(['details', 'bankAccount', 'categories'])->where('uuid', $uuid)->firstOrFail();

        // Cleanup any old cached PDF files for this UUID first
        $this->cleanupPdfStorage($uuid);

        // Dynamic signers resolution:
        // If deposit has custom overridden signers, use them.
        // Otherwise, dynamically fetch the latest default_signers from Profile so updates in Profile apply to all non-overridden reports!
        $signers = $deposit->signers;
        $user = request()->user() ?: \App\Models\User::first();
        if (empty($signers) && $user && !empty($user->default_signers)) {
            $signers = $user->default_signers;
        }

        $base64Image = null;
        if ($deposit->proof_image_path && Storage::exists($deposit->proof_image_path)) {
            $fileContent = Storage::get($deposit->proof_image_path);
            $mime = Storage::mimeType($deposit->proof_image_path);
            
            if (str_contains($mime, 'image')) {
                $base64Image = 'data:' . $mime . ';base64,' . base64_encode($fileContent);
            }
        }

        // Versioned URL parameter based on updated_at timestamp to ensure QR code matrix updates on data changes & prevents browser caching
        $versionTimestamp = $deposit->updated_at ? $deposit->updated_at->timestamp : time();
        $verificationUrl = route('deposit.pdf', $deposit->uuid) . '?v=' . $versionTimestamp;
        
        $qrCodeBase64 = QrCodeHelper::generateBase64Svg($verificationUrl, 90);

        $pdf = Pdf::loadView('pdf.deposit-report', compact('deposit', 'signers', 'base64Image', 'qrCodeBase64'));
        
        $pdfOutput = $pdf->output();

        $pdfPath = 'private/pdfs/laporan_setoran_' . $deposit->uuid . '.pdf';
        // Save the newly generated PDF version
        Storage::put($pdfPath, $pdfOutput);

        $filename = 'laporan_setoran_' . $deposit->deposit_date->format('Y_m_d') . '_' . substr($deposit->uuid, 0, 8) . '.pdf';
        
        // Return stream with cache-busting headers so mobile browsers always fetch fresh PDF
        return response($pdfOutput, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Helper to clean up any cached/overridden PDF files for a given UUID.
     */
    private function cleanupPdfStorage(string $uuid): void
    {
        $path = 'private/pdfs/laporan_setoran_' . $uuid . '.pdf';
        if (Storage::exists($path)) {
            Storage::delete($path);
        }
    }

    /**
     * Helper to check if submitted signers match the profile default_signers.
     */
    private function isSameSigners(?array $signers1, ?array $signers2): bool
    {
        if (empty($signers1) && empty($signers2)) return true;
        if (empty($signers1) || empty($signers2)) return false;
        
        // Clean array structure comparison
        $clean1 = array_values(array_filter($signers1, fn($s) => !empty($s['name']) || !empty($s['title'])));
        $clean2 = array_values(array_filter($signers2, fn($s) => !empty($s['name']) || !empty($s['title'])));

        return json_encode($clean1) === json_encode($clean2);
    }
}
