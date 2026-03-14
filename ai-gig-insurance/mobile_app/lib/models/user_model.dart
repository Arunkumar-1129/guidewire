class UserModel {
  final String userId;
  final String name;
  final String phone;
  final String platform;
  final String city;
  final double dailyIncome;
  final double riskScore;
  final String riskLabel;
  final double weeklyPremium;
  final String policyStatus;
  final double totalPayout;
  final int recentClaims;

  UserModel({
    required this.userId,
    required this.name,
    required this.phone,
    required this.platform,
    required this.city,
    required this.dailyIncome,
    this.riskScore = 0.0,
    this.riskLabel = 'LOW',
    this.weeklyPremium = 0.0,
    this.policyStatus = 'inactive',
    this.totalPayout = 0.0,
    this.recentClaims = 0,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        userId:        json['user_id']        ?? '',
        name:          json['name']           ?? '',
        phone:         json['phone']          ?? '',
        platform:      json['platform']       ?? '',
        city:          json['city']           ?? '',
        dailyIncome:   (json['daily_income']  ?? 0).toDouble(),
        riskScore:     (json['risk_score']    ?? 0).toDouble(),
        riskLabel:     json['risk_label']     ?? 'LOW',
        weeklyPremium: (json['weekly_premium']?? 0).toDouble(),
        policyStatus:  json['policy_status']  ?? 'inactive',
        totalPayout:   (json['total_payout']  ?? 0).toDouble(),
        recentClaims:  json['recent_claims']  ?? 0,
      );
}
