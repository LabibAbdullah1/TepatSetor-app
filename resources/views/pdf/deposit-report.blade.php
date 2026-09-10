<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Setoran Kas - {{ $deposit->deposit_date->format('d F Y') }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .subtitle {
            font-size: 11px;
            color: #6b7280;
            margin: 3px 0 0 0;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 3px 0;
            vertical-align: middle;
        }
        .meta-label {
            font-weight: bold;
            color: #4b5563;
            width: 130px;
        }
        .meta-value {
            color: #1f2937;
        }
        .badge {
            display: inline-block;
            padding: 2px 7px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
            vertical-align: middle;
            line-height: 1;
        }
        .badge-completed {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        .badge-draft {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            margin-top: 15px;
            margin-bottom: 8px;
            border-left: 3px solid #1e3a8a;
            padding-left: 8px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .details-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            font-size: 11px;
            text-transform: uppercase;
        }
        .details-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .details-table .total-row {
            background-color: #f3f4f6 !important;
            font-weight: bold;
        }
        .details-table .total-row td {
            border-top: 2px solid #1e3a8a;
            border-bottom: 2px solid #1e3a8a;
            font-size: 13px;
        }
        .notes-section {
            background-color: #f9fafb;
            border-left: 3px solid #1e3a8a;
            padding: 10px 12px;
            margin-bottom: 20px;
            border-radius: 0 4px 4px 0;
        }
        .notes-title {
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 0;
            margin-bottom: 4px;
            font-size: 11px;
            text-transform: uppercase;
        }
        .signatures-container {
            width: 100%;
            margin-top: 35px;
            page-break-inside: avoid;
        }
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .signatures-table td {
            text-align: center;
            vertical-align: top;
            padding: 0 10px;
        }
        .signature-title {
            font-weight: bold;
            color: #374151;
            font-size: 11px;
            margin-bottom: 50px;
        }
        .signature-name {
            font-weight: bold;
            color: #111827;
            font-size: 12px;
            text-decoration: underline;
        }
        .signature-sub {
            color: #6b7280;
            font-size: 10px;
            margin-top: 2px;
        }
        .proof-section {
            page-break-inside: avoid;
            margin-top: 30px;
            text-align: center;
        }
        .proof-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
            margin-bottom: 12px;
            text-align: left;
            text-transform: uppercase;
        }
        .proof-image {
            max-width: 100%;
            max-height: 400px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 4px;
            background-color: #ffffff;
        }
        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }
    </style>
</head>
<body>

    <!-- Header Block -->
    <div class="header">
        <h1 class="title">Laporan Setoran Kas</h1>
        <p class="subtitle">Sistem Pelaporan Setoran Kas Transparan (TepatSetor-app)</p>
    </div>

    <!-- Metadata Grid -->
    <table class="meta-table">
        <tr>
            <td class="meta-label">No. Transaksi</td>
            <td class="meta-value">: {{ $deposit->uuid }}</td>
            <td class="meta-label" style="width: 100px;">Tanggal Setor</td>
            <td class="meta-value">: {{ $deposit->deposit_date->format('d F Y') }}</td>
        </tr>
        <tr>
            <td class="meta-label">Status</td>
            <td class="meta-value">: @if($deposit->status === 'completed')<span class="badge badge-completed">Selesai (Completed)</span>@else<span class="badge badge-draft">Draf (Draft)</span>@endif</td>
            <td class="meta-label">Waktu Cetak</td>
            <td class="meta-value">: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i') }} WIB</td>
        </tr>
        @if($deposit->bankAccount)
        <tr>
            <td class="meta-label">Rekening Tujuan</td>
            <td class="meta-value" colspan="3">: {{ $deposit->bankAccount->bank_name }} - {{ $deposit->bankAccount->account_number }} (a.n. {{ $deposit->bankAccount->account_holder_name }})</td>
        </tr>
        @endif
    </table>

    <!-- Denominations Breakdown Table -->
    <div class="section-title">Rincian Pecahan Uang Setoran</div>
    <table class="details-table">
        <thead>
            <tr>
                <th>Denominasi Uang</th>
                <th class="text-center" style="width: 120px;">Jumlah (Qty)</th>
                <th class="text-right" style="width: 200px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @php
                $activeDetails = $deposit->details->filter(function($detail) {
                    return $detail->quantity > 0;
                });
            @endphp

            @forelse($activeDetails as $detail)
                <tr>
                    <td style="font-weight: bold;">Rp {{ number_format($detail->denomination, 0, ',', '.') }}</td>
                    <td class="text-center">{{ number_format($detail->quantity, 0, ',', '.') }} lembar/keping</td>
                    <td class="text-right font-bold">Rp {{ number_format($detail->subtotal, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center" style="color: #6b7280; font-style: italic; padding: 15px;">
                        Tidak ada rincian pecahan uang yang diinputkan.
                    </td>
                </tr>
            @endforelse

            <!-- Grand Total Summary Row -->
            <tr class="total-row">
                <td colspan="2" style="font-size: 13px; text-transform: uppercase;">Total Nilai Uang Disetor</td>
                <td class="text-right">Rp {{ number_format($deposit->grand_total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <!-- Optional Categories Breakdown (if available) -->
    @if($deposit->categories && count($deposit->categories) > 0)
        <div class="section-title">Keterangan / Rincian Kategori Setoran</div>
        <table class="details-table" style="margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="width: 40px;" class="text-center">No</th>
                    <th>Peruntukan / Kategori Setoran</th>
                    <th class="text-right" style="width: 200px;">Nominal (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($deposit->categories as $index => $cat)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td style="font-weight: bold;">{{ $cat->category_name }}</td>
                        <td class="text-right font-bold">Rp {{ number_format($cat->amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="2" style="font-size: 12px; text-transform: uppercase;">Total Kategori Setoran</td>
                    <td class="text-right">Rp {{ number_format($deposit->categories->sum('amount'), 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    @endif

    <!-- Notes Block -->
    @if($deposit->notes)
        <div class="notes-section">
            <h4 class="notes-title">Catatan Setoran</h4>
            <p style="margin: 0; white-space: pre-wrap; color: #374151;">{{ $deposit->notes }}</p>
        </div>
    @endif

    <!-- Embedded Attachment Block -->
    @if($base64Image)
        <div class="proof-section">
            <h4 class="proof-title">Lampiran Bukti Setoran (Slip Bank)</h4>
            <img class="proof-image" src="{{ $base64Image }}" alt="Bukti Slip Setoran Bank">
        </div>
    @endif

    <!-- Signatures Block (2 or 3 Signers) -->
    @php
        $signersList = isset($signers) && !empty($signers) ? $signers : ($deposit->signers ?: []);
        $activeSigners = array_values(array_filter($signersList, function($s) {
            return !empty($s['name']) || !empty($s['title']);
        }));
        $signerCount = count($activeSigners);
    @endphp

    @if($signerCount > 0)
        <div class="signatures-container">
            <div class="text-center" style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; color: #4b5563;">Mengetahui</div>
            <table class="signatures-table">
                <tr>
                    @php
                        $colWidth = $signerCount === 3 ? '33.33%' : '50%';
                    @endphp
                    @foreach($activeSigners as $s)
                        <td style="width: {{ $colWidth }};">
                            <div class="signature-title">{{ $s['title'] ?: 'Penanda Tangan' }}</div>
                            <div class="signature-name">{{ $s['name'] ?: '........................' }}</div>
                            @if(!empty($s['title']))
                                <div class="signature-sub">{{ $s['title'] }}</div>
                            @endif
                        </td>
                    @endforeach
                </tr>
            </table>
        </div>
    @endif

    <!-- Document Authenticity QR Verification Stamp -->
    @if(!empty($qrCodeBase64))
        <div style="margin-top: 25px; border-top: 1px dashed #cbd5e1; padding-top: 10px; page-break-inside: avoid;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 75px; vertical-align: middle;">
                        <img src="{{ $qrCodeBase64 }}" alt="QR Verification" style="width: 70px; height: 70px;" />
                    </td>
                    <td style="vertical-align: middle; padding-left: 10px; color: #64748b; font-size: 9px; line-height: 1.3;">
                        <strong style="color: #1e3a8a; font-size: 10px; text-transform: uppercase;">VERIFIKASI KEASLIAN DOKUMEN (DIGITAL STAMP)</strong><br />
                        Dokumen laporan ini sah & terverifikasi secara digital melalui sistem <strong>TepatSetor-app</strong>.<br />
                        ID Transaksi: <span style="font-family: monospace; font-weight: bold; color: #334155;">{{ $deposit->uuid }}</span> | Waktu: {{ now()->timezone('Asia/Jakarta')->format('d/m/Y H:i') }} WIB<br />
                        Total Nilai Disetor: <strong style="color: #047857;">Rp {{ number_format($deposit->grand_total, 0, ',', '.') }}</strong>
                    </td>
                </tr>
            </table>
        </div>
    @endif

</body>
</html>
