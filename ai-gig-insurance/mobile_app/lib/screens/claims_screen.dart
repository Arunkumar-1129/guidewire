import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/claim_model.dart';
import '../widgets/claim_card.dart';

class ClaimsScreen extends StatefulWidget {
  final String userId;
  final String? city;
  const ClaimsScreen({super.key, required this.userId, this.city});
  @override State<ClaimsScreen> createState() => _ClaimsScreenState();
}

class _ClaimsScreenState extends State<ClaimsScreen> {
  List<ClaimModel> _claims = [];
  bool _loading = true, _triggering = false;

  @override void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getClaims(widget.userId);
      final list  = (data['claims'] as List? ?? []);
      setState(() { _claims = list.map((e) => ClaimModel.fromJson(e)).toList(); _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
      _snack(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _triggerDemo() async {
    setState(() => _triggering = true);
    try {
      final res = await ApiService.triggerDemo(
        userId:     widget.userId,
        eventType:  'rain',
        eventValue: 150,
        city:       widget.city ?? 'Chennai',
      );
      _snack('Demo: ${res['message']} | Payout: ₹${res['payout']}');
      await _load();
    } catch (e) {
      _snack(e.toString().replaceAll('Exception: ', ''));
    }
    setState(() => _triggering = false);
  }

  void _snack(String m) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m), duration: const Duration(seconds: 3)));

  @override
  Widget build(BuildContext context) {
    final paid = _claims.where((c) => c.status == 'paid').fold<double>(0, (s, c) => s + c.payout);
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        backgroundColor: Colors.transparent, foregroundColor: Colors.white,
        title: const Text('Claims History', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _load)],
      ),
      body: Column(children: [
        // Summary bar
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1a1a2e), borderRadius: BorderRadius.circular(16),
          ),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
            _summary('Total', '${_claims.length}', Colors.white70),
            _summary('Paid', '${_claims.where((c) => c.status == "paid").length}', const Color(0xFF22c55e)),
            _summary('Fraud', '${_claims.where((c) => c.isFraud).length}', const Color(0xFFef4444)),
            _summary('Earned', '₹${paid.toStringAsFixed(0)}', const Color(0xFFFF6B35)),
          ]),
        ),
        // Demo trigger button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SizedBox(
            width: double.infinity, height: 46,
            child: ElevatedButton.icon(
              onPressed: _triggering ? null : _triggerDemo,
              icon: const Icon(Icons.flash_on, size: 18),
              label: _triggering
                  ? const Text('Triggering...')
                  : const Text('Simulate Rain Trigger (Demo)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF3b82f6), foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF6B35)))
              : _claims.isEmpty
                  ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Text('🎉', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 12),
                      Text('No claims yet. Stay safe!',
                          style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 16)),
                    ]))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _claims.length,
                      itemBuilder: (_, i) => ClaimCard(claim: _claims[i]),
                    ),
        ),
      ]),
    );
  }

  Widget _summary(String label, String value, Color color) {
    return Column(children: [
      Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
      Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
    ]);
  }
}
