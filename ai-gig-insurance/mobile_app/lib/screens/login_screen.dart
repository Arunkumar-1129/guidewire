import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'register_screen.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _login() async {
    if (_phoneCtrl.text.trim().length < 10) {
      _snack('Enter a valid 10-digit phone number');
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await ApiService.login(_phoneCtrl.text.trim());
      await ApiService.saveSession(res['user_id'], res['token'], res['name']);
      if (mounted) {
        Navigator.pushReplacement(context,
            MaterialPageRoute(builder: (_) => DashboardScreen(userId: res['user_id'])));
      }
    } catch (e) {
      _snack(e.toString().replaceAll('Exception: ', ''));
    }
    setState(() => _loading = false);
  }

  void _snack(String msg) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 60),
              Container(
                width: 90, height: 90,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFFF6B35), Color(0xFFFFB347)]),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(Icons.shield, color: Colors.white, size: 48),
              ),
              const SizedBox(height: 24),
              const Text('GigShield', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('AI Insurance for Delivery Workers',
                  style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 15)),
              const SizedBox(height: 60),
              _field('Phone Number', _phoneCtrl, TextInputType.phone),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _loading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF6B35),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Login', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                child: const Text('New worker? Register here →',
                    style: TextStyle(color: Color(0xFFFF6B35), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(String hint, TextEditingController ctrl, TextInputType type) {
    return TextField(
      controller: ctrl,
      keyboardType: type,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.4)),
        filled: true,
        fillColor: const Color(0xFF1a1a2e),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        prefixIcon: Icon(Icons.phone, color: Colors.white.withOpacity(0.4)),
      ),
    );
  }
}
