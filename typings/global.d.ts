/// <reference types="node" />

interface JSONSchemaError extends Error {
  validationErrors?: string[];
}
