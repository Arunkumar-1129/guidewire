import 'package:flutter/material.dart';
import '../models/claim_model.dart';

class ClaimCard extends StatelessWidget {
  final ClaimModel claim;
  const ClaimCard({super.key, required this.claim});

  Color _statusColor() {
    switch (claim.status) {
      case 'paid':     return const Color(0xFF22c55e);
      case 'pending':  return const Color(0xFFf59e0b);
      case 'rejected': return const Color(0xFFef4444);
      default:         return const Color(0xFF6b7280);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _statusColor().withOpacity(0.3)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            color: _statusColor().withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(claim.eventIcon, style: const TextStyle(fontSize: 22)),
          ),
        ),
        title: Text(
          '${claim.eventType.toUpperCase()} — ${claim.city}',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              'Value: ${claim.eventValue.toStringAsFixed(1)} | Payout: ₹${claim.payout.toStringAsFixed(0)}',
              style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: _statusColor().withOpacity(0.2),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _statusColor()),
          ),
          child: Text(
            claim.status.toUpperCase(),
            style: TextStyle(color: _statusColor(), fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
