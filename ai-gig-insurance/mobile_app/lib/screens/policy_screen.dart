import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/policy_card.dart';

class PolicyScreen extends StatefulWidget {
  final String userId;
  const PolicyScreen({super.key, required this.userId});
  @override State<PolicyScreen> createState() => _PolicyScreenState();
}

class _PolicyScreenState extends State<PolicyScreen> {
  Map<String, dynamic>? _policy;
  bool _loading = true, _activating = false;

  @override void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getPolicy(widget.userId);
      setState(() { _policy = data; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
      _snack(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> _activate() async {
    setState(() => _activating = true);
    try {
      await ApiService.activatePolicy(widget.userId);
      _snack('✅ Policy activated for 7 days!');
      await _load();
    } catch (e) {
      _snack(e.toString().replaceAll('Exception: ', ''));
    }
    setState(() => _activating = false);
  }

  void _snack(String m) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m)));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        backgroundColor: Colors.transparent, foregroundColor: Colors.white,
        title: const Text('My Insurance Policy', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF6B35)))
          : _policy == null
              ? const Center(child: Text('No policy found', style: TextStyle(color: Colors.white)))
              : ListView(padding: const EdgeInsets.all(20), children: [
                  PolicyCard(
                    status:   _policy!['status'] ?? 'inactive',
                    premium:  (_policy!['premium'] ?? 0).toDouble(),
                    coverage: (_policy!['coverage']?? 0).toDouble(),
                    expiresAt: _policy!['expires_at'],
                    onActivate: _activating ? null : _activate,
                  ),
                  const SizedBox(height: 24),
                  _infoSection(),
                ]),
    );
  }

  Widget _infoSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1a1a2e), borderRadius: BorderRadius.circular(20),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Coverage Details', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _coverItem('🌧️ Heavy Rain (>100mm)', '₹600 payout'),
        _coverItem('🌫️ High Pollution (AQI>200)', '₹400 payout'),
        _coverItem('🌡️ Heatwave (>40°C)', '₹500 payout'),
        const Divider(color: Colors.white12, height: 32),
        const Text('How it works:', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text('1. AI monitors weather every 10 min\n2. If disruption occurs, claim auto-triggers\n3. Fraud check by Isolation Forest AI\n4. ₹ credited to your UPI instantly',
            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13, height: 1.8)),
      ]),
    );
  }

  Widget _coverItem(String event, String payout) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(event, style: const TextStyle(color: Colors.white70, fontSize: 14)),
        Text(payout, style: const TextStyle(color: Color(0xFF22c55e), fontWeight: FontWeight.bold)),
      ]),
    );
  }
}
