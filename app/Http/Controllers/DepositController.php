<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDepositRequest;
use App\Http\Requests\UpdateDepositRequest;
use App\Models\Deposit;
use App\Models\DepositDetail;
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
        $deposits = Deposit::with(['details', 'bankAccount'])
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
                    'grand_total' => $grandTotal,
                    'status' => $request->input('status'),
                    'proof_image_path' => $proofImagePath,
                    'bank_account_id' => $request->input('bank_account_id'),
                ]);

                foreach ($detailsData as $detail) {
                    $deposit->details()->create($detail);
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
        $deposit = Deposit::with('details')->where('uuid', $uuid)->firstOrFail();
        $bankAccounts = request()->user()->bankAccounts()->orderBy('bank_name')->get();

        return Inertia::render('DepositForm', [
            'deposit' => $deposit,
            'bankAccounts' => $bankAccounts,
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

                $deposit->delete(); // Cascading delete will handle details automatically via DB constraint
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
     * Generate PDF report.
     */
    public function generatePdf($uuid)
    {
        $deposit = Deposit::with(['details', 'bankAccount'])->where('uuid', $uuid)->firstOrFail();

        $base64Image = null;
        if ($deposit->proof_image_path && Storage::exists($deposit->proof_image_path)) {
            $fileContent = Storage::get($deposit->proof_image_path);
            $mime = Storage::mimeType($deposit->proof_image_path);
            
            if (str_contains($mime, 'image')) {
                $base64Image = 'data:' . $mime . ';base64,' . base64_encode($fileContent);
            }
        }

        $pdf = Pdf::loadView('pdf.deposit-report', compact('deposit', 'base64Image'));
        
        $filename = 'laporan_setoran_' . $deposit->deposit_date->format('Y_m_d') . '_' . $deposit->uuid . '.pdf';
        
        return $pdf->stream($filename);
    }
}
