<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Setoran Kas - {{ $deposit->deposit_date->format('d F Y') }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .title {
            font-size: 22px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .subtitle {
            font-size: 11px;
            color: #6b7280;
            margin: 5px 0 0 0;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 25px;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 4px 0;
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
            padding: 3px 8px;
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
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .details-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            font-size: 12px;
        }
        .details-table td {
            padding: 10px;
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
            font-size: 14px;
        }
        .notes-section {
            background-color: #f9fafb;
            border-left: 4px solid #1e3a8a;
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 0 6px 6px 0;
        }
        .notes-title {
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 12px;
            text-transform: uppercase;
        }
        .proof-section {
            page-break-inside: avoid;
            margin-top: 40px;
            text-align: center;
        }
        .proof-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-align: left;
            text-transform: uppercase;
        }
        .proof-image {
            max-width: 100%;
            max-height: 420px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 5px;
            background-color: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        <h1 class="title">Laporan Setoran Kas Masjid Istiqomah</h1>
        <p class="subtitle">Personal Cash Deposit Reporting System (TepatSetor-app)</p>
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
                // Show only non-zero items, keeping report clean
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
                    <td colspan="3" class="text-center" style="color: #6b7280; font-style: italic; padding: 20px;">
                        Tidak ada rincian pecahan uang yang diinputkan.
                    </td>
                </tr>
            @endforelse

            <!-- Grand Total Summary Row -->
            <tr class="total-row">
                <td colspan="2" style="font-size: 13px; text-transform: uppercase;">Total Nilai Setoran</td>
                <td class="text-right">Rp {{ number_format($deposit->grand_total, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

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

</body>
</html>
