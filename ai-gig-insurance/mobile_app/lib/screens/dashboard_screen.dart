import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/user_model.dart';
import 'policy_screen.dart';
import 'claims_screen.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  final String userId;
  const DashboardScreen({super.key, required this.userId});
  @override State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  UserModel? _user;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getDashboard(widget.userId);
      setState(() { _user = UserModel.fromJson(data); _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
      _snack(e.toString().replaceAll('Exception: ', ''));
    }
  }

  void _snack(String m) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m)));

  Color _riskColor(String label) {
    switch (label) {
      case 'LOW':      return const Color(0xFF22c55e);
      case 'MEDIUM':   return const Color(0xFFf59e0b);
      case 'HIGH':     return const Color(0xFFef4444);
      case 'CRITICAL': return const Color(0xFF7c3aed);
      default:         return const Color(0xFF6b7280);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        backgroundColor: Colors.transparent, foregroundColor: Colors.white,
        title: Text(_user != null ? 'Hi, ${_user!.name} 👋' : 'Dashboard',
            style: const TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
          IconButton(icon: const Icon(Icons.logout), onPressed: () async {
            await ApiService.clearSession();
            if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
          }),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF6B35)))
          : _user == null
              ? const Center(child: Text('Failed to load', style: TextStyle(color: Colors.white)))
              : RefreshIndicator(onRefresh: _load, child: _body()),
      bottomNavigationBar: _bottomNav(),
    );
  }

  Widget _body() {
    final u = _user!;
    return ListView(padding: const EdgeInsets.all(20), children: [
      // Risk Score Card
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [_riskColor(u.riskLabel).withOpacity(0.2), const Color(0xFF1a1a2e)],
            begin: Alignment.topLeft, end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _riskColor(u.riskLabel).withOpacity(0.4)),
        ),
        child: Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('AI Risk Assessment', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13)),
            const SizedBox(height: 8),
            Text(u.riskLabel, style: TextStyle(color: _riskColor(u.riskLabel), fontSize: 28, fontWeight: FontWeight.bold)),
            Text('Score: ${(u.riskScore * 100).toStringAsFixed(0)}/100',
                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
          ])),
          Container(
            width: 70, height: 70,
            decoration: BoxDecoration(
              color: _riskColor(u.riskLabel).withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(color: _riskColor(u.riskLabel), width: 2),
            ),
            child: Center(child: Text('${(u.riskScore * 100).toStringAsFixed(0)}',
                style: TextStyle(color: _riskColor(u.riskLabel), fontSize: 20, fontWeight: FontWeight.bold))),
          ),
        ]),
      ),
      const SizedBox(height: 16),
      // Stats Row
      Row(children: [
        _statCard('Weekly Premium', '₹${u.weeklyPremium.toStringAsFixed(0)}', const Color(0xFFFF6B35), Icons.receipt_long),
        const SizedBox(width: 12),
        _statCard('Policy', u.policyStatus.toUpperCase(),
            u.policyStatus == 'active' ? const Color(0xFF22c55e) : const Color(0xFFf59e0b), Icons.shield),
      ]),
      const SizedBox(height: 12),
      Row(children: [
        _statCard('Total Payout', '₹${u.totalPayout.toStringAsFixed(0)}', const Color(0xFF3b82f6), Icons.account_balance_wallet),
        const SizedBox(width: 12),
        _statCard('Claims', '${u.recentClaims}', const Color(0xFF8b5cf6), Icons.history),
      ]),
      const SizedBox(height: 24),
      // Worker Info
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: const Color(0xFF1a1a2e), borderRadius: BorderRadius.circular(16)),
        child: Column(children: [
          _infoRow('Platform', u.platform),
          _infoRow('City', u.city),
          _infoRow('Daily Income', '₹${u.dailyIncome.toStringAsFixed(0)}'),
        ]),
      ),
    ]);
  }

  Widget _statCard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1a1a2e),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
          Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
        ]),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5))),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ]),
    );
  }

  Widget _bottomNav() {
    return BottomNavigationBar(
      backgroundColor: const Color(0xFF1a1a2e), selectedItemColor: const Color(0xFFFF6B35),
      unselectedItemColor: Colors.white38, currentIndex: 0,
      onTap: (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => PolicyScreen(userId: widget.userId)));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => ClaimsScreen(userId: widget.userId)));
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
        BottomNavigationBarItem(icon: Icon(Icons.shield), label: 'Policy'),
        BottomNavigationBarItem(icon: Icon(Icons.history), label: 'Claims'),
      ],
    );
  }
}
