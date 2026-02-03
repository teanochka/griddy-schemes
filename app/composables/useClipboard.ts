
import { type Node, createNode } from '@/types/node'

export function useClipboard() {
    /**
     * Copy nodes to the system clipboard
     */
    async function copy(nodes: Node[]) {
        if (!nodes.length) return

        try {
            const data = {
                app: 'griddy-schemes',
                type: 'nodes',
                payload: nodes,
            }
            await navigator.clipboard.writeText(JSON.stringify(data))
        } catch (err) {
            console.error('Failed to copy nodes:', err)
        }
    }

    /**
     * Paste nodes from the system clipboard
     * @returns Array of new nodes with regenerated IDs and positions
     */
    async function paste(): Promise<Node[]> {
        try {
            const text = await navigator.clipboard.readText()
            if (!text) return []

            let data: any
            try {
                data = JSON.parse(text)
            } catch {
                return [] // Not JSON
            }

            // Check if it's our data
            if (data?.app !== 'griddy-schemes' || data?.type !== 'nodes' || !Array.isArray(data.payload)) {
                return []
            }

            const nodes: Node[] = []

            // Process nodes: regenerate IDs and shift position slightly
            // We can't know the mouse position here easily without passing it in, 
            // so we'll just return the processed nodes and let the caller handle position adjustments if needed,
            // OR we just do a default offset here. The caller will likely handle the final placement context.
            // But for a simple "paste" command, offsetting from original is standard behavior if no target generic position is known.

            // However, if we paste multiple times, we want them to stack? 
            // For now, let's just return fresh copies.

            for (const originalNode of data.payload) {
                // Generate a new ID
                const newId = Date.now() + Math.random() * 1000

                // clone and update ID
                const newNode: Node = {
                    ...originalNode,
                    id: newId,
                    x: originalNode.x + 20,
                    y: originalNode.y + 20
                }

                nodes.push(newNode)
            }

            return nodes
        } catch (err) {
            console.error('Failed to paste nodes:', err)
            return []
        }
    }

    return {
        copy,
        paste
    }
}
