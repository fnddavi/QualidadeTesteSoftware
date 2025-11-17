import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Contact {
    id: string;
    name: string;
    phone: string;
}

export function ContactList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const navigate = useNavigate();

    // Carrega contatos ao entrar na tela
    useEffect(() => {
        api.get('/contacts') // Rota definida no contacts.routes.ts
            .then(response => setContacts(response.data.data || response.data))
            .catch(error => console.error("Erro ao listar", error));
    }, []);

    async function handleDelete(id: string) {
        if (confirm('Tem certeza que deseja excluir?')) {
            try {
                await api.delete(`/contacts/${id}`);
                setContacts(contacts.filter(contact => contact.id !== id));
            } catch (error) {
                alert('Erro ao excluir contato');
            }
        }
    }

    return (
        <div>
            <h1>Meus Contatos</h1>
            <button onClick={() => navigate('/contacts/new')}>Novo Contato</button>

            <ul>
                {contacts.map(contact => (
                    <li key={contact.id} style={{ margin: '10px 0', border: '1px solid #ccc', padding: '10px' }}>
                        <strong>{contact.name}</strong> - {contact.phone}
                        <div style={{ marginTop: '5px' }}>
                            {/* Passamos o objeto contact inteiro via state porque o backend não tem rota GET /contacts/:id */}
                            <button onClick={() => navigate(`/contacts/edit/${contact.id}`, { state: contact })}>
                                Editar
                            </button>
                            <button onClick={() => handleDelete(contact.id)} style={{ marginLeft: '10px', color: 'red' }}>
                                Excluir
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}