import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Driver de banco fora do bundle do servidor: é o padrão documentado para
  // clientes de Postgres. Do Next 16.1 em diante o Turbopack resolve as
  // dependências transitivas do pacote sozinho.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
