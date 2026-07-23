// Liveness/readiness probe target for the Kubernetes Deployment
// (see k8s/deployment.yaml). Deliberately has no auth and touches no
// external services — it should only reflect whether the server process
// itself is up and able to serve a request.
export async function GET() {
  return Response.json({ ok: true });
}
