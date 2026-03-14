import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameCtrl   = TextEditingController();
  final _phoneCtrl  = TextEditingController();
  final _incomeCtrl = TextEditingController();
  String _platform  = 'Swiggy';
  String _city      = 'Chennai';
  bool _loading     = false;

  final platforms = ['Swiggy', 'Zomato', 'Dunzo', 'Blinkit'];
  final cities    = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

  Future<void> _register() async {
    if (_nameCtrl.text.trim().isEmpty || _phoneCtrl.text.trim().length < 10) {
      _snack('Fill all fields correctly');
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await ApiService.register(
        name: _nameCtrl.text.trim(), phone: _phoneCtrl.text.trim(),
        platform: _platform, city: _city,
        dailyIncome: double.tryParse(_incomeCtrl.text) ?? 1000,
      );
      await ApiService.saveSession(res['user_id'], res['token'], _nameCtrl.text.trim());
      if (mounted) {
        _snack('Welcome! Risk: ${res['risk_label']} | Premium: ₹${res['weekly_premium']}');
        await Future.delayed(const Duration(seconds: 1));
        Navigator.pushReplacement(context,
            MaterialPageRoute(builder: (_) => DashboardScreen(userId: res['user_id'])));
      }
    } catch (e) {
      _snack(e.toString().replaceAll('Exception: ', ''));
    }
    setState(() => _loading = false);
  }

  void _snack(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      appBar: AppBar(
        backgroundColor: Colors.transparent, foregroundColor: Colors.white,
        title: const Text('Register', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Create your account', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('AI will calculate your risk & premium instantly',
                style: TextStyle(color: Colors.white.withOpacity(0.5))),
            const SizedBox(height: 32),
            _field('Full Name', _nameCtrl, Icons.person, TextInputType.name),
            const SizedBox(height: 16),
            _field('Phone Number', _phoneCtrl, Icons.phone, TextInputType.phone),
            const SizedBox(height: 16),
            _field('Daily Income (₹)', _incomeCtrl, Icons.currency_rupee, TextInputType.number),
            const SizedBox(height: 16),
            _dropdown('Delivery Platform', _platform, platforms, (v) => setState(() => _platform = v!)),
            const SizedBox(height: 16),
            _dropdown('City', _city, cities, (v) => setState(() => _city = v!)),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity, height: 54,
              child: ElevatedButton(
                onPressed: _loading ? null : _register,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF6B35),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Register & Get AI Risk Score',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(String hint, TextEditingController ctrl, IconData icon, TextInputType type) {
    return TextField(
      controller: ctrl, keyboardType: type,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint, hintStyle: TextStyle(color: Colors.white.withOpacity(0.4)),
        filled: true, fillColor: const Color(0xFF1a1a2e),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        prefixIcon: Icon(icon, color: Colors.white.withOpacity(0.4)),
      ),
    );
  }

  Widget _dropdown(String label, String value, List<String> items, void Function(String?) onChanged) {
    return DropdownButtonFormField<String>(
      value: value, onChanged: onChanged,
      dropdownColor: const Color(0xFF1a1a2e),
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label, labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
        filled: true, fillColor: const Color(0xFF1a1a2e),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
      ),
      items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
    );
  }
}
