import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin, Node-özel modüller (grpc, gaxios vb.) içerir; Turbopack/webpack
  // bunları client tarafı gibi bundle etmeye çalışmasın diye external bırakılır.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
