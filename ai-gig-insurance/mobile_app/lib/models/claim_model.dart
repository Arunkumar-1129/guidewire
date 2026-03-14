class ClaimModel {
  final String claimId;
  final String userId;
  final String eventType;
  final double eventValue;
  final double payout;
  final String status;
  final bool isFraud;
  final String city;
  final String? triggeredAt;

  ClaimModel({
    required this.claimId,
    required this.userId,
    required this.eventType,
    required this.eventValue,
    required this.payout,
    required this.status,
    required this.isFraud,
    required this.city,
    this.triggeredAt,
  });

  factory ClaimModel.fromJson(Map<String, dynamic> json) => ClaimModel(
        claimId:     json['claim_id']    ?? '',
        userId:      json['user_id']     ?? '',
        eventType:   json['event_type']  ?? '',
        eventValue:  (json['event_value']?? 0).toDouble(),
        payout:      (json['payout']     ?? 0).toDouble(),
        status:      json['status']      ?? 'pending',
        isFraud:     json['is_fraud']    ?? false,
        city:        json['city']        ?? '',
        triggeredAt: json['triggered_at'],
      );

  String get eventIcon {
    switch (eventType) {
      case 'rain':      return '🌧️';
      case 'pollution': return '🌫️';
      case 'heatwave':  return '🌡️';
      default:          return '⚡';
    }
  }

  String get statusColor {
    switch (status) {
      case 'paid':     return '#22c55e';
      case 'pending':  return '#f59e0b';
      case 'rejected': return '#ef4444';
      default:         return '#6b7280';
    }
  }
}
