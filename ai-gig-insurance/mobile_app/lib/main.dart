import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/api_service.dart';

void main() => runApp(const GigShieldApp());

class GigShieldApp extends StatelessWidget {
  const GigShieldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GigShield',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.dark(primary: const Color(0xFFFF6B35)),
        scaffoldBackgroundColor: const Color(0xFF0a0a0f),
        fontFamily: 'Roboto',
      ),
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    await Future.delayed(const Duration(seconds: 2));
    final session = await ApiService.getSession();
    if (!mounted) return;
    if (session['user_id'] != null && session['user_id']!.isNotEmpty) {
      Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (_) => DashboardScreen(userId: session['user_id']!)));
    } else {
      Navigator.pushReplacement(context,
          MaterialPageRoute(builder: (_) => const LoginScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0f),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100, height: 100,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF6B35), Color(0xFFFFB347)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: [BoxShadow(color: const Color(0xFFFF6B35).withOpacity(0.4), blurRadius: 30, spreadRadius: 5)],
              ),
              child: const Icon(Icons.shield, color: Colors.white, size: 56),
            ),
            const SizedBox(height: 24),
            const Text('GigShield', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('AI Insurance for Gig Workers',
                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 15)),
            const SizedBox(height: 48),
            const CircularProgressIndicator(color: Color(0xFFFF6B35)),
          ],
        ),
      ),
    );
  }
}
