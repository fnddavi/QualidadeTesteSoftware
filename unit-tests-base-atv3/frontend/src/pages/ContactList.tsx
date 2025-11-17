import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Contact {
    id: string;
    name: string;
    phone: string;
}

export function ContactList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const navigate = useNavigate();
    const { signOut, user } = useAuth(); // Podemos pegar dados do user ou função de logout

    useEffect(() => {
        loadContacts();
    }, []);

    async function loadContacts() {
        try {
            // Rota GET / definida em contacts.routes.ts
            const response = await api.get('/contacts');
            setContacts(response.data.data || response.data);
        } catch (error) {
            console.error("Erro ao carregar contatos", error);
        }
    }

    async function handleDelete(id: string) {
        if (confirm('Tem certeza que deseja excluir este contato?')) {
            try {
                await api.delete(`/contacts/${id}`);
                // Atualiza a lista localmente removendo o item
                setContacts(prev => prev.filter(contact => contact.id !== id));
            } catch (error) {
                alert('Erro ao excluir contato.');
            }
        }
    }

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
                <h2>Contatos de {user?.name || 'Usuário'}</h2>
                <button onClick={signOut} style={{ background: '#f44336' }}>Sair</button>
            </header>

            <div style={{ marginBottom: '1rem' }}>
                <button onClick={() => navigate('/contacts/new')}>+ Novo Contato</button>
            </div>

            {contacts.length === 0 ? (
                <p>Nenhum contato encontrado.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {contacts.map(contact => (
                        <li key={contact.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <strong>{contact.name}</strong>
                                <div style={{ color: '#666' }}>{contact.phone}</div>
                            </div>
                            <div>
                                {/* Enviamos o objeto contato via state para evitar nova requisição na edição */}
                                <button
                                    onClick={() => navigate(`/contacts/edit/${contact.id}`, { state: contact })}
                                    style={{ marginRight: '0.5rem' }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(contact.id)}
                                    style={{ background: '#ffebee', color: '#c62828' }}
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}