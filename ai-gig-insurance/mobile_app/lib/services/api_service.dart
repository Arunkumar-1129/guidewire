import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Change to your local IP if testing on a real device: http://192.168.x.x:8000
  static const String baseUrl = 'http://10.0.2.2:8000'; // Android emulator

  // ── Auth ────────────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> register({
    required String name,
    required String phone,
    required String platform,
    required String city,
    required double dailyIncome,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name, 'phone': phone, 'platform': platform,
        'city': city, 'daily_income': dailyIncome,
      }),
    );
    return _handle(res);
  }

  static Future<Map<String, dynamic>> login(String phone) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );
    return _handle(res);
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> getDashboard(String userId) async {
    final res = await http.get(Uri.parse('$baseUrl/users/dashboard/$userId'));
    return _handle(res);
  }

  // ── Policy ──────────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> getPolicy(String userId) async {
    final res = await http.get(Uri.parse('$baseUrl/policies/$userId'));
    return _handle(res);
  }

  static Future<Map<String, dynamic>> activatePolicy(String userId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/policies/activate'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'user_id': userId}),
    );
    return _handle(res);
  }

  // ── Claims ──────────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> getClaims(String userId) async {
    final res = await http.get(Uri.parse('$baseUrl/claims/$userId'));
    return _handle(res);
  }

  static Future<Map<String, dynamic>> triggerDemo({
    required String userId,
    required String eventType,
    required double eventValue,
    required String city,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/claims/trigger-demo'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'user_id': userId, 'event_type': eventType,
        'event_value': eventValue, 'city': city,
      }),
    );
    return _handle(res);
  }

  // ── Local Storage ────────────────────────────────────────────────────────────
  static Future<void> saveSession(String userId, String token, String name) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_id', userId);
    await prefs.setString('token', token);
    await prefs.setString('name', name);
  }

  static Future<Map<String, String?>> getSession() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'user_id': prefs.getString('user_id'),
      'token':   prefs.getString('token'),
      'name':    prefs.getString('name'),
    };
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // ── Helper ──────────────────────────────────────────────────────────────────
  static Map<String, dynamic> _handle(http.Response res) {
    final body = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw Exception(body['detail'] ?? 'Request failed: ${res.statusCode}');
    }
    return body;
  }
}
