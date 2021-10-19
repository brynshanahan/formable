import { useState } from 'react';
import { uuid } from '../utils/uuid';

export function useIdentity () {
  const [ident] = useState(() => uuid(8))
  return ident
}