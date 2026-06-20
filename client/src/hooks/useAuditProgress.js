import { useEffect, useState } from 'react';
import { auditApi } from '../api/auditApi';

export function useAuditProgress(auditId) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    if (!auditId) return undefined;
    let active = true;
    const timer = setInterval(async () => {
      const { data } = await auditApi.status(auditId);
      if (!active) return;
      setStatus(data);
      if (['completed', 'failed'].includes(data.status)) clearInterval(timer);
    }, 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [auditId]);
  return status;
}
