# ULTRON development connection — prepared configuration

This change prepares a GitHub Actions development workflow for lonzycooper1/ultron-direct-revenue. It does not modify Linda Workflow Services, whose source is a separate Sites repository.

## Implemented
- Ten selectable role profiles, with independent Quality Auditor review.
- Two bounded API requests per task, with no retries.
- Allowlisted edits to public/index.html only.
- No generated code is executed; all existing markup, attributes, scripts and styles remain byte-identical. Only visible page text can change.
- Existing destinations remain intact; changing or adding markup, destinations or active code is rejected.
- Exact reverse/reapply verification and a review artifact.
- A separate job can publish the reviewed edit to an agent branch and open a pull request.
- No automatic merge, production deploy, secret edits, permission edits, or controller self-editing.

These role profiles are not the ten saved OpenAI Platform agent IDs. Connecting those definitions as live tool users is a separate step.

## Required activation
1. Merge this setup after reviewing it.
2. Configure a GitHub environment named ultron-development-write with Lonzy as required reviewer BEFORE enabling the workflow. Environment protection availability must be verified for the account. A name alone does not enforce review.
3. Authorize the workflow to create branches and pull requests in this repository only. No administration access.
4. Securely provision a separate OpenAI credential as ULTRON_DEVELOPMENT_OPENAI_KEY. Never paste it into repository files or chat. Use project spending controls; a token limit alone is not a monetary budget.
5. Run one manual task and inspect the actual artifact and PR before enabling any repeated operation.

## Deployment remains unresolved
Railway has a service linked to this repository, but inspection showed no deployment or public domain for that service. Automatic deployment and rollback cannot be called verified. A production release needs an explicitly selected service, confirmed source branch, a tested deployment, health URL, and an independent release controller. This PR deliberately does not grant those permissions.

## What approval would grant
Persistent workflow access to generate edits and create repository branches/PRs, plus bounded model usage through a dedicated credential. Production permissions are excluded until a separate release controller is tested and reviewed.

The local validation checks are content checks, not proof of application behavior. The software-rewrite prototype is a first component, not an unrestricted or fully enabled self-deploying agent system.
