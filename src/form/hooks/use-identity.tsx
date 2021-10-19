import { useState } from 'react';
import { uuid } from '../utils/uuid';

export function useIdentity () {
  const [id] = useState(() => uuid(8))
  return id
}