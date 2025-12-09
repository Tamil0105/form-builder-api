export interface RoutingRule {
  sourceQuestionId: string;
  condition: 'equals' | 'notEquals' | 'contains';
  value: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  routingRule?: RoutingRule;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
