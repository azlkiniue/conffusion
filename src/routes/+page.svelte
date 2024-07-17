<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { merge } from '$lib/components/common/handleConfigYaml';

	let activeTab = 'base';
	function changeTab(tab: string) {
		activeTab = tab;
	}

	let base = '';
	let added = '';
	let merged = '';
	function reset() {
		base = '';
		added = '';
		merged = '';
		changeTab('base');
	}
</script>

<Tabs.Root value={activeTab}>
	<Tabs.Content value="base">
		<Card.Root>
			<Card.Header>
				<Card.Title>Start</Card.Title>
				<Card.Description>
					Fill in your current config here. Click next to add new config to merge.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="space-y-1">
					<Label for="base">Base config</Label>
					<Textarea id="base" class="font-mono" bind:value={base} />
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-end">
				<Button on:click={() => changeTab('add')}>Next</Button>
			</Card.Footer>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="add">
		<Card.Root>
			<Card.Header>
				<Card.Title>Add</Card.Title>
				<Card.Description>
					Add your new config here. Click next to merge.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="space-y-1">
					<Label for="add">New config</Label>
					<Textarea id="add" class="font-mono" bind:value={added} />
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button variant="outline" on:click={() => changeTab('base')}>Previous</Button>
				<Button
					on:click={() => {
						changeTab('merged');
						merged = merge(base, added);
					}}>Next</Button
				>
			</Card.Footer>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content value="merged">
		<Card.Root>
			<Card.Header>
				<Card.Title>Merge</Card.Title>
				<Card.Description>
					Your merged config is ready. Click start over to reset.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="space-y-1">
					<Label for="merged">Result config</Label>
					<Textarea id="merged" class="font-mono" bind:value={merged} />
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				<Button variant="outline" on:click={() => changeTab('add')}>Previous</Button>
				<Button on:click={() => reset()}>Start Over</Button>
			</Card.Footer>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>
