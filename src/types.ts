export type RiskLevel = 'low' | 'medium' | 'high';

export type ErrorCode =
  | 'auth_missing'
  | 'auth_invalid'
  | 'invalid_request'
  | 'invalid_json'
  | 'not_found'
  | 'rate_limited'
  | 'internal_error'
  | 'provider_unavailable';

export interface ErrorDetail {
  field: string;
  reason: string;
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    request_id: string | null;
    details: ErrorDetail[];
  };
}

export interface DetectionMeta {
  list_version: string;
  cache_hit: boolean;
  processing_ms: number;
  provider_status: 'disabled' | 'ok';
}

export interface DetectionResult {
  email: string;
  normalized_email: string;
  domain: string;
  is_disposable: boolean;
  risk_level: RiskLevel;
  signals: string[];
  meta: DetectionMeta;
}
