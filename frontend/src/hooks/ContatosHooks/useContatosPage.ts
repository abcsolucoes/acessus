import { useEffect, useState } from "react"
import { decodeToken } from "../../services/api";
import type { Contact } from "../../types";
import { deleteContato, listContatos } from "../../services/ContatosServices/contatosApi";

export function useContatosPage() {
    const [user, setUser] = useState<{ name: string; role: string; sub: string } | null>(null)
    const [contacts, setContacts] = useState<Contact[]>([])
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        function onScroll() { setShowScrollTop(window.scrollY > 300) }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        setUser(decodeToken())

        async function load() {
            try {
                const data = await listContatos();

                setContacts(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    async function handleDelete(resourceName: string) {
        await deleteContato(resourceName);
        setContacts(prev => prev.filter(c => c.resourceName !== resourceName))
    }

    return {
        user,
        contacts,
        setContacts,
        handleDelete,
        showScrollTop,
        loading,
    }
}