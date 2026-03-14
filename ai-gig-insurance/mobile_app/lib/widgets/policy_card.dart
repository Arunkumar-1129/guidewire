import 'package:flutter/material.dart';

class PolicyCard extends StatelessWidget {
  final String status;
  final double premium;
  final double coverage;
  final String? expiresAt;
  final VoidCallback? onActivate;

  const PolicyCard({
    super.key,
    required this.status,
    required this.premium,
    required this.coverage,
    this.expiresAt,
    this.onActivate,
  });

  Color get _statusColor {
    switch (status) {
      case 'active':   return const Color(0xFF22c55e);
      case 'inactive': return const Color(0xFFf59e0b);
      case 'expired':  return const Color(0xFFef4444);
      default:         return const Color(0xFF6b7280);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF1a1a2e), const Color(0xFF16213e)],
          begin: Alignment.topLeft, end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _statusColor.withOpacity(0.4), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('🛡️ GigShield Policy',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: _statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _statusColor),
                ),
                child: Text(status.toUpperCase(),
                    style: TextStyle(color: _statusColor, fontWeight: FontWeight.bold, fontSize: 11)),
              )
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _infoChip('Weekly Premium', '₹${premium.toStringAsFixed(0)}'),
              const SizedBox(width: 12),
              _infoChip('Max Coverage', '₹${coverage.toStringAsFixed(0)}'),
            ],
          ),
          if (expiresAt != null) ...[
            const SizedBox(height: 12),
            Text('Expires: $expiresAt',
                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
          ],
          if (status != 'active') ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onActivate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF6B35),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Activate Insurance', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _infoChip(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
