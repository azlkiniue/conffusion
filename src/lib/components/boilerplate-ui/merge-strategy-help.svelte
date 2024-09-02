<script lang="ts">
	import { codeToHtml } from 'shiki';
	import { onMount } from 'svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import QuestionMarkCircled from 'svelte-radix/QuestionMarkCircled.svelte';

	let snippets: Record<string, string> = {
		contextFirstInput: `- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: context
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: context
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: context`,
		contextFirstOutput: `- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: context
- context:
    cluster: kubernetes-context-2
    user: kubernetes-admin-context-2
  name: context-2
- context:
    cluster: kubernetes-context-3
    user: kubernetes-admin-context-3
  name: context-3`,
		contextLastInput: `- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes`,
		contextLastOutput: `- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
- context:
    cluster: kubernetes-2
    user: kubernetes-admin-2
  name: kubernetes-admin-2@kubernetes-2
- context:
    cluster: kubernetes-3
    user: kubernetes-admin-3
  name: kubernetes-admin-3@kubernetes-3`
	};

	let html: Record<string, string> = {};
	onMount(async () => {
		for (const key in snippets) {
			html[key] = await codeToHtml(snippets[key], {
				lang: 'yaml',
				theme: 'vitesse-dark'
			});
		}
	});
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<QuestionMarkCircled class="ml-1 h-4 w-4 text-muted-foreground hover:text-primary" />
	</Sheet.Trigger>
	<Sheet.Content class="overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>Merge Strategy</Sheet.Title>
			<Sheet.Description class="text-primary [&>p]:text-justify">
				<p class="mt-2">
					Conffusion provides two merge strategies for handling Kubernetes configuration files: <span
						class="font-semibold">Context First</span
					>
					and <span class="font-semibold">Context Last</span>. Each strategy determines how
					duplicate context (and other) names are automatically renamed during the merge process.
				</p>

				<h2
					class="mt-4 scroll-m-20 border-b pb-1 font-bold tracking-tight transition-colors first:mt-0"
				>
					Context First Strategy
				</h2>
				<p class="mt-2">
					The <span class="font-semibold">Context First</span> strategy prioritizes the name of the context
					when merging. After renaming duplicate contexts, the new name will be appended to the corresponding
					user and cluster names.
				</p>
				<p class="mt-2 font-medium underline">Before merge example</p>
				<div class="mt-2 [&>pre]:overflow-x-auto [&>pre]:rounded-lg [&>pre]:p-2">
					{@html html.contextFirstInput}
				</div>
				<p class="mt-2 font-medium underline">After merge example</p>
				<div class="mt-2 [&>pre]:overflow-x-auto [&>pre]:rounded-lg [&>pre]:p-2">
					{@html html.contextFirstOutput}
				</div>

				<h2
					class="mt-4 scroll-m-20 border-b pb-1 font-bold tracking-tight transition-colors first:mt-0"
				>
					Context Last Strategy
				</h2>
				<p class="mt-2">
					The <span class="font-semibold">Context Last</span> strategy renames duplicated cluster
					and user names first. The context name will be rewritten last in the format
					<span
						class="[&>code]:relative [&>code]:rounded [&>code]:bg-muted [&>code]:px-[0.3rem] [&>code]:py-[0.2rem] [&>code]:font-mono"
					>
						<code>{'<user-name>@<cluster-name>'}</code>.
					</span>
				</p>
				<p class="mt-2 font-medium underline">Before merge example</p>
				<div class="mt-2 [&>pre]:overflow-x-auto [&>pre]:rounded-lg [&>pre]:p-2">
					{@html html.contextLastInput}
				</div>
				<p class="mt-2 font-medium underline">After merge example</p>
				<div class="mt-2 [&>pre]:overflow-x-auto [&>pre]:rounded-lg [&>pre]:p-2">
					{@html html.contextLastOutput}
				</div>

				<h2
					class="mt-4 scroll-m-20 border-b pb-1 font-bold tracking-tight transition-colors first:mt-0"
				>
					Strategy Selection
				</h2>
				<ul class="ml-3 mt-2 list-disc">
					<li>
						Use <span class="font-semibold">Context First</span> strategy when you have custom context
						names or when you want minimal changes to your context names.
					</li>
					<li>
						Use <span class="font-semibold">Context Last</span> strategy when you use default
						context names or when you want to use
						<span
							class="[&>code]:relative [&>code]:rounded [&>code]:bg-muted [&>code]:px-[0.3rem] [&>code]:py-[0.2rem] [&>code]:font-mono"
						>
							<code>{'<user>@<cluster>'}</code> context name format.
						</span>
					</li>
				</ul>
			</Sheet.Description>
		</Sheet.Header>
	</Sheet.Content>
</Sheet.Root>
