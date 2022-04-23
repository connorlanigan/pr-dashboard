import React, { useEffect, useState } from 'react';

export function ClientSide({
  children,
}: React.PropsWithChildren<Record<never, never>>) {
  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);

  if (!client) {
    return null;
  }

  return <>{children}</>;
}
