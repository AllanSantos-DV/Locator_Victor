/**
 * Script para testar a autenticação da API sem depender do frontend
 */

console.log('Iniciando testes de autenticação...');

// Ajuste a URL base conforme necessário
const API_URL = 'http://localhost:8080/api';

// Função para registrar um novo usuário
async function testRegister() {
  try {
    console.log('Testando registro de usuário...');
    
    const userData = {
      name: 'Usuário Teste',
      email: 'teste2@example.com',
      password: 'senha123'
    };
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('Resposta do registro:', data);
    
    if (response.ok) {
      console.log('Registro bem-sucedido!');
      return data;
    } else {
      console.error('Falha no registro:', data.message || 'Erro desconhecido');
      return null;
    }
  } catch (error) {
    console.error('Erro durante o registro:', error);
    return null;
  }
}

// Função para autenticar um usuário
async function testAuthenticate() {
  try {
    console.log('Testando autenticação de usuário...');
    
    // Usuário que acabamos de criar com sucesso
    const userData = {
      email: 'teste@example.com',
      password: 'senha123'
    };
    
    const response = await fetch(`${API_URL}/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('Resposta da autenticação:', data);
    
    if (response.ok) {
      console.log('Autenticação bem-sucedida!');
      console.log('Token JWT:', data.token);
      return data;
    } else {
      console.error('Falha na autenticação:', data.message || 'Erro desconhecido');
      return null;
    }
  } catch (error) {
    console.error('Erro durante a autenticação:', error);
    return null;
  }
}

// Função para testar o acesso a um endpoint protegido
async function testProtectedEndpoint(token) {
  if (!token) {
    console.error('Token não fornecido para testar endpoint protegido');
    return;
  }
  
  try {
    console.log('Testando acesso a endpoint protegido...');
    
    const response = await fetch(`${API_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Acesso ao endpoint protegido bem-sucedido:', data);
    } else {
      console.error('Falha ao acessar endpoint protegido. Status:', response.status);
      const errorData = await response.text();
      console.error('Detalhes:', errorData);
    }
  } catch (error) {
    console.error('Erro ao acessar endpoint protegido:', error);
  }
}

// Função principal que executa os testes
async function runTests() {
  console.log('Iniciando bateria de testes...');
  
  // Testar autenticação com o usuário criado
  const authResult = await testAuthenticate();
  
  if (authResult?.token) {
    // Se a autenticação for bem-sucedida, testar um endpoint protegido
    await testProtectedEndpoint(authResult.token);
  } else {
    console.log('Tentando registrar um novo usuário...');
    const registerResult = await testRegister();
    
    if (registerResult?.token) {
      // Se o registro for bem-sucedido, testar um endpoint protegido
      await testProtectedEndpoint(registerResult.token);
    }
  }
  
  console.log('Testes concluídos!');
}

// Executar os testes
runTests(); 