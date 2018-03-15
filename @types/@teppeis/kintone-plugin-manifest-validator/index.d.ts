// TODO: should be provided by kintone-plugin-manifest-validator

declare function validator(
  manifestJson: Object,
  options?: Object
): { valid: boolean; errors: Array<any> };

export = validator;
