import type { Lab } from '../lib/types';

/**
 * Real, end-to-end gcloud CLI scenarios. Every lab uses free-tier-friendly
 * sizing where possible and ends with an explicit cleanup step — set a
 * budget alert before running any of these (Section 1).
 */
export const GCP_LABS: Lab[] = [
	{
		id: 'static-site-on-storage',
		title: 'Host a Static Website on Cloud Storage',
		scenario:
			'Publish a simple static site (index.html + a 404 page) directly from a Cloud Storage bucket, with no VM or web server involved.',
		difficulty: 'basic',
		minutes: 15,
		tags: ['Cloud Storage', 'IAM'],
		prerequisites: [
			'A GCP project with billing enabled',
			'gcloud CLI installed and authenticated (`gcloud init`)',
		],
		whatYouLearn: [
			'Creating and configuring a Cloud Storage bucket for website hosting',
			'Making objects publicly readable with an IAM binding',
			'Why bucket names must be globally unique',
		],
		interviewAngle:
			'"How would you host a static site cheaply, with no servers to manage?" is a common scenario question — Cloud Storage static hosting is the textbook answer, and knowing the exact IAM step to make it public (without over-granting) is the detail that separates a real answer from a guess.',
		steps: [
			{
				title: 'Create the bucket',
				body: 'Bucket names are globally unique across all of GCP — pick something specific to you.',
				code: 'gcloud storage buckets create gs://my-static-site-demo-12345 \\\n  --location=us-central1',
				lang: 'bash',
			},
			{
				title: 'Configure it for website hosting',
				code: 'gcloud storage buckets update gs://my-static-site-demo-12345 \\\n  --web-main-page-suffix=index.html \\\n  --web-error-page=404.html',
				lang: 'bash',
			},
			{
				title: 'Upload the site files',
				body: 'Create a minimal index.html locally first, e.g. `echo "<h1>Hello from Cloud Storage</h1>" > index.html`.',
				code: 'gcloud storage cp index.html gs://my-static-site-demo-12345/\ngcloud storage cp 404.html gs://my-static-site-demo-12345/',
				lang: 'bash',
			},
			{
				title: 'Make the bucket contents public',
				body: 'allUsers means literally anyone on the internet, unauthenticated — the standard way to serve fully public static content.',
				code: 'gcloud storage buckets add-iam-policy-binding gs://my-static-site-demo-12345 \\\n  --member=allUsers \\\n  --role=roles/storage.objectViewer',
				lang: 'bash',
			},
		],
		verify: [
			'`gcloud storage buckets describe gs://my-static-site-demo-12345` shows the website config',
			'Visiting `https://storage.googleapis.com/my-static-site-demo-12345/index.html` in a browser (no auth) shows the page',
		],
		cleanup:
			'gcloud storage rm -r gs://my-static-site-demo-12345',
	},
	{
		id: 'vm-behind-load-balancer',
		title: 'Deploy a Scaling Web App Behind a Load Balancer',
		scenario:
			'Create an Instance Template, a regional Managed Instance Group running a tiny web server, and put a global HTTP Load Balancer in front of it.',
		difficulty: 'intermediate',
		minutes: 35,
		tags: ['Compute Engine', 'Instance Groups', 'Load Balancing'],
		prerequisites: [
			'A GCP project with billing enabled',
			'gcloud CLI installed and authenticated',
		],
		whatYouLearn: [
			'Building a reusable Instance Template with a startup script',
			'Creating a regional Managed Instance Group from it',
			'Wiring a health check, backend service, URL map, and forwarding rule together',
		],
		interviewAngle:
			'"Deploy a scalable web app" is one of the most common practical GCP tasks — it proves you can compose Compute Engine, Instance Groups, and Load Balancing into one working system, not just describe each piece in isolation.',
		steps: [
			{
				title: 'Create an Instance Template with a startup script',
				code: `gcloud compute instance-templates create web-template \\
  --machine-type=e2-small \\
  --image-family=debian-12 \\
  --image-project=debian-cloud \\
  --tags=http-server \\
  --metadata=startup-script='#! /bin/bash
apt-get update
apt-get install -y apache2'`,
				lang: 'bash',
			},
			{
				title: 'Allow HTTP traffic to tagged instances',
				code: 'gcloud compute firewall-rules create allow-http \\\n  --allow=tcp:80 \\\n  --target-tags=http-server \\\n  --direction=INGRESS',
				lang: 'bash',
			},
			{
				title: 'Create a regional Managed Instance Group',
				code: 'gcloud compute instance-groups managed create web-mig \\\n  --template=web-template \\\n  --size=2 \\\n  --region=us-central1',
				lang: 'bash',
			},
			{
				title: 'Create a health check and backend service',
				code: `gcloud compute health-checks create http web-health-check --port=80

gcloud compute backend-services create web-backend-service \\
  --protocol=HTTP \\
  --health-checks=web-health-check \\
  --global

gcloud compute backend-services add-backend web-backend-service \\
  --instance-group=web-mig \\
  --instance-group-region=us-central1 \\
  --global`,
				lang: 'bash',
			},
			{
				title: 'Wire up the URL map, proxy, and forwarding rule',
				code: `gcloud compute url-maps create web-url-map \\
  --default-service=web-backend-service

gcloud compute target-http-proxies create web-http-proxy \\
  --url-map=web-url-map

gcloud compute forwarding-rules create web-forwarding-rule \\
  --global \\
  --target-http-proxy=web-http-proxy \\
  --ports=80`,
				lang: 'bash',
			},
		],
		verify: [
			'`gcloud compute forwarding-rules describe web-forwarding-rule --global` shows an assigned IP',
			'`curl http://<assigned-ip>` returns the Apache default page after a couple of minutes (health checks need time to pass)',
			'`gcloud compute backend-services get-health web-backend-service --global` shows both instances HEALTHY',
		],
		cleanup: `gcloud compute forwarding-rules delete web-forwarding-rule --global --quiet
gcloud compute target-http-proxies delete web-http-proxy --quiet
gcloud compute url-maps delete web-url-map --quiet
gcloud compute backend-services delete web-backend-service --global --quiet
gcloud compute health-checks delete web-health-check --quiet
gcloud compute instance-groups managed delete web-mig --region=us-central1 --quiet
gcloud compute instance-templates delete web-template --quiet
gcloud compute firewall-rules delete allow-http --quiet`,
	},
	{
		id: 'gke-autopilot-deploy',
		title: 'Deploy a Containerized App to GKE Autopilot',
		scenario:
			'Spin up a GKE Autopilot cluster, deploy a sample container image, and expose it with a LoadBalancer Service.',
		difficulty: 'intermediate',
		minutes: 25,
		tags: ['GKE', 'Kubernetes'],
		prerequisites: [
			'A GCP project with billing enabled',
			'gcloud CLI installed and authenticated',
			'kubectl installed (or use Cloud Shell, which has it pre-installed)',
		],
		whatYouLearn: [
			'Creating a GKE Autopilot cluster',
			'Getting kubectl credentials for a GKE cluster',
			'Deploying and exposing a workload with standard Kubernetes commands',
		],
		interviewAngle:
			'"Get a container running on GKE" is the practical follow-up to any GKE theory question — it proves the theory translates into an actual working deployment, and that you understand GKE gives you a completely standard Kubernetes API underneath.',
		steps: [
			{
				title: 'Create an Autopilot cluster',
				body: 'This takes several minutes — Autopilot provisions the entire managed control plane.',
				code: 'gcloud container clusters create-auto my-cluster \\\n  --region=us-central1',
				lang: 'bash',
			},
			{
				title: 'Get kubectl credentials',
				code: 'gcloud container clusters get-credentials my-cluster \\\n  --region=us-central1\n\nkubectl get nodes',
				lang: 'bash',
			},
			{
				title: 'Deploy a sample app',
				code: 'kubectl create deployment hello-web \\\n  --image=us-docker.pkg.dev/google-samples/containers/gke/hello-app:1.0',
				lang: 'bash',
			},
			{
				title: 'Expose it with a LoadBalancer Service',
				code: 'kubectl expose deployment hello-web \\\n  --port=80 --target-port=8080 \\\n  --type=LoadBalancer',
				lang: 'bash',
			},
		],
		verify: [
			'`kubectl get pods` shows hello-web Running',
			'`kubectl get service hello-web` eventually shows an EXTERNAL-IP (may take a minute)',
			'`curl http://<external-ip>` returns the sample app\'s response',
		],
		cleanup: `kubectl delete service hello-web
kubectl delete deployment hello-web
gcloud container clusters delete my-cluster --region=us-central1 --quiet`,
	},
	{
		id: 'private-vpc-with-firewall',
		title: 'Set Up a Private VPC with Firewall Rules',
		scenario:
			'Build a custom-mode VPC with a single regional subnet, then create a firewall rule that only allows SSH from your own IP — not the entire internet.',
		difficulty: 'basic',
		minutes: 20,
		tags: ['VPC', 'Networking', 'Firewall Rules'],
		prerequisites: [
			'A GCP project with billing enabled',
			'gcloud CLI installed and authenticated',
		],
		whatYouLearn: [
			'Creating a custom-mode VPC and a regional subnet',
			'Scoping a firewall rule\'s source range instead of leaving it open to 0.0.0.0/0',
			'Confirming default-deny ingress behavior on a fresh custom-mode VPC',
		],
		interviewAngle:
			'Locking SSH access down to a specific IP range instead of the entire internet is exactly the kind of security-hygiene detail interviewers probe for — it shows you don\'t just get things working, you get them working safely.',
		steps: [
			{
				title: 'Create a custom-mode VPC',
				code: 'gcloud compute networks create demo-vpc --subnet-mode=custom',
				lang: 'bash',
			},
			{
				title: 'Create a subnet in it',
				code: 'gcloud compute networks subnets create demo-subnet \\\n  --network=demo-vpc \\\n  --region=us-central1 \\\n  --range=10.0.0.0/24',
				lang: 'bash',
			},
			{
				title: 'Confirm ingress is denied by default',
				body: 'Launch a VM into this VPC (using the same e2-micro pattern from earlier labs) and try to SSH into it — it should time out, since no firewall rule allows it yet.',
			},
			{
				title: 'Create a firewall rule scoped to your own IP only',
				body: 'Replace YOUR_IP with your actual public IP (e.g. from `curl ifconfig.me`) — never leave source-ranges at 0.0.0.0/0 for SSH in anything beyond a quick throwaway test.',
				code: 'gcloud compute firewall-rules create allow-ssh-from-me \\\n  --network=demo-vpc \\\n  --direction=INGRESS \\\n  --action=ALLOW \\\n  --rules=tcp:22 \\\n  --source-ranges=YOUR_IP/32 \\\n  --target-tags=ssh-allowed',
				lang: 'bash',
			},
		],
		verify: [
			'`gcloud compute firewall-rules list --filter="network:demo-vpc"` shows only your scoped rule',
			'SSH into a VM tagged ssh-allowed in this VPC now succeeds from your machine',
			'SSH still fails from a different network (e.g. your phone\'s hotspot) — proving the rule is genuinely scoped, not accidentally open',
		],
		cleanup: `gcloud compute firewall-rules delete allow-ssh-from-me --quiet
gcloud compute networks subnets delete demo-subnet --region=us-central1 --quiet
gcloud compute networks delete demo-vpc --quiet`,
	},
	{
		id: 'least-privilege-service-account',
		title: 'Grant Least-Privilege Access with a Custom Service Account',
		scenario:
			'Create a service account that can only read from one specific Cloud Storage bucket — nothing else — and attach it to a VM instead of using a downloaded key file.',
		difficulty: 'intermediate',
		minutes: 20,
		tags: ['IAM', 'Service Accounts', 'Cloud Storage'],
		prerequisites: [
			'Completed "Host a Static Website on Cloud Storage" (or any existing bucket)',
			'gcloud CLI installed and authenticated',
		],
		whatYouLearn: [
			'Creating a dedicated service account for a single workload',
			'Scoping a role binding to one bucket instead of the whole project',
			'Attaching a service account to a VM instead of generating a key file',
		],
		interviewAngle:
			'"Grant a VM access to exactly one bucket, nothing more" is a classic least-privilege exercise — it tests whether your default instinct is a broad role (Editor/Storage Admin) or the narrowest predefined role that actually does the job.',
		steps: [
			{
				title: 'Create the service account',
				code: 'gcloud iam service-accounts create bucket-reader-sa \\\n  --display-name="Bucket Reader Only"',
				lang: 'bash',
			},
			{
				title: 'Grant it read access to ONE specific bucket only',
				body: 'Note the binding target is the bucket itself, not the project — this is what keeps the grant narrow.',
				code: 'gcloud storage buckets add-iam-policy-binding gs://my-static-site-demo-12345 \\\n  --member=serviceAccount:bucket-reader-sa@PROJECT_ID.iam.gserviceaccount.com \\\n  --role=roles/storage.objectViewer',
				lang: 'bash',
			},
			{
				title: 'Attach it to a new VM directly (no key file)',
				code: 'gcloud compute instances create reader-vm \\\n  --machine-type=e2-micro \\\n  --zone=us-central1-a \\\n  --service-account=bucket-reader-sa@PROJECT_ID.iam.gserviceaccount.com \\\n  --scopes=cloud-platform',
				lang: 'bash',
			},
			{
				title: 'Confirm scope: it can read the bucket, but nothing else',
				body: 'SSH into reader-vm, then try both commands — the first should succeed, the second should fail with a permission error.',
				code: '# Should succeed\ngcloud storage ls gs://my-static-site-demo-12345/\n\n# Should fail — no permission to list VMs\ngcloud compute instances list',
				lang: 'bash',
			},
		],
		verify: [
			'From reader-vm, listing the target bucket succeeds',
			'From reader-vm, any other GCP API call (e.g. listing VMs) fails with a 403 permission error',
			'No JSON key file was ever generated or downloaded for this service account',
		],
		cleanup: `gcloud compute instances delete reader-vm --zone=us-central1-a --quiet
gcloud iam service-accounts delete bucket-reader-sa@PROJECT_ID.iam.gserviceaccount.com --quiet`,
	},
];

export const GCP_LAB_TAGS = Array.from(
	new Set(GCP_LABS.flatMap(l => l.tags)),
).sort();

export function getGcpLab(id: string): Lab | undefined {
	return GCP_LABS.find(l => l.id === id);
}
