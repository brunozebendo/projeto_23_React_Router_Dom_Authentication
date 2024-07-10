/**esse é o código da seção 23 - aula 366 - que adiciona Authentication to
 * React, ele vai usar o mesmo código da ultima seção, mas com o backend modificado.
 * Authentication é necessário se o conteúdo deve ser protegido, não deve ser acessado
 * por qualquer um.
 * Para um Client (Browser) conseguir acesso ao Server (backend) ele faz um Request
 * com um user credentials (credenciais de usuário) e o backend gera um Response,
 * sendo q um yes ou no não é suficiente, usa-se então dois tipos de autenticação
 * 
 * Server side Sessions - guarda um identificador unico no servidor, manda o mesmo
 * identificador para o cliente, o cliente manda esse identificador junto com os
 * requests para proteger os recursos, o Servidor pode então checar se o identificador
 * é válido, se é igual o anteriormente emitido (issued) do servidor para o cliente.
 * 
 * Authentication Tokens - Criado, mas não guardado, um "permision" token no servidor é
 * mandado para o cliente. O cliente anexa o token para futuros requerimentos, o servidor
 * pode então verificar o token.
 * 
 * Nesse código será usada essa segundo opção
 * A aula 369 insere uma lógica para mudar a UI da página, um título e o botão, no caso, 
 * ao se clicar um botão, mas mantendo o resto do layout e o caminho (path). Isso era
 * feito com useState e foi mudado para o formato abaixo.
 * O useSearchParams é usado para esse controle de estado
 */
import { Form, Link, useSearchParams } from 'react-router-dom';

/**Dentro da function é feito o desctructuring, lá é usado o [searchParam] para
 * achar o parâmetro necessário. Nesse caso se o mode for igual login, o isLogin é true
 */

function AuthForm() {
    const [searchParams] = useSearchParams();
    const isLogin = searchParams.get('mode') === 'login';

/**Assim, o isLogin servirá para setar dinâmicamente o título */

  <>
    /**Assim, o isLogin servirá para setar dinâmicamente o título */
    <h1>{isLogin ? 'Log in' : 'Create a new user'}</h1>
    /**também o to e o endereço do Link. Reparar na sintaxe com o ? e `` necessários
     * para funcionar */
    <Link to={`?mode=${isLogin ? 'signup' : 'login'}`}>
      {isLogin ? 'Create new user' : 'Login'}
    </Link></>}

/**Na aula 370 é inserida a lógica para fazer o submit da nova informação inserida no 
 * formulário. O formulário está no componente AuthForm.js, mas a lógica 
 * vai ficar no Authentication.js que retorna o Authform. Abaixo, parte do componente:
 */
/**aqui é criada uma action, o request é o q dá acesso as informações do formulário
 */
export async function action({request}) {

/**Conforme explicado acima, o mesmo formulário pode estar no modo
 * login ou signup (primeiro acesso ou assinatura), portanto,
 * é preciso primeiro saber em qual modo está. Para isso foi utilizada
 * a função built-in do browser chamada URL, que guarda qual é a URL,
 * ela é utilizada mais abaixo para saber se o formulário está no mode ou login
 */
    const searchParams = new URL(request.url).searchParams;
    const mode = searchParams.get('mode') || 'login';
  /**esse if é para prevenir caso o usuário tente forçar escrevendo um
   * novo path que não seja mode ou login
   */
    if(mode !== 'login' && mode !== 'sigunp') {
      throw json({message: 'Unsupported mode.'}, { status: 422});
    }
  
  /**aqui é a lógica para obter os dados do formulário usando o request
   * e o formData já que o formulário está na tag <Form>
   */
    const data = await request.formData();
    const authData = {
      email: data.get('email'),
      password: data.get('password'),
    };
  /**conforme lógica acima, aqui o fetch vai tentar postar os dados no http do backend
   * no modo login ou signup. O método é postar já que a informação está sendo incluída,
   * o headers é um nome padrão (não explicou) e o body é o que vai no modo json,
   * nesse caso, os dados apurados mais acima.
   */
    const response = await fetch('http://localhost:8080/' + mode, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authData)
    });
  /**aqui a lógica para lidar com possíveis erros programados no backend
   * e mostrá-los no formulário
   */
    if (response.status === 422 || response.status === 401){
      return response;
    }
    //aqui para caso sejam outros erro q não os de cima
    if (!response.ok) {
      throw json({message: 'Could not authenticate user'}, {status: 500});
    }
    return redirect('/');
  }
  /**Não esquecer de incluir a action no App.js */

  import AuthenticationPage, {action as authAction } from "./pages/Authentication";
  {
    path:'auth',
    element: <AuthenticationPage />,
    action: authAction,
  },
  /**Aula 371 insere a lógica para mostrar possíveis erros de autenticação.
 * No componente AuthForm.js vai ser inserido o código para obter e mostrar
 * os dados retornados na resposta da Action de submit. Para isso, usa-se
 * o hook do RRD, useActionData
*/
const data = useActionData();
/**esse hook é usado para obter o atual estados da navegação */
const navigation = useNavigation();
//usando-o, pode-se obter o estados da navegação, se estiver sendo submetido
const isSubmitting = navigation.state === 'submitting'
//o botão é desabilitado e mostra um texto diferente
<button disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : "Save"}
          </button>

/**assim, se houver dados e se houver erros nesses dados, é mostrada uma 
 * unordered list usando a função interna Object.values para mapear e mostrar todos
 * os erros.
 */
{data && data.errors && (<ul>
  {Object.values(data.errors).map((err) => (
    <li key={err}>{err}</li>
  ))}
  </ul>
/**Aula 373 vai finalmente criar o token para fins de autenticação, este foi criado
 * no backend, então no frontend é preciso obter e guardar a informação desse token.
 * No componente Authentication.js é inserido o seguinte código no final da action
 * de submissão do formulário. Assim, os dados de resposta são guardados
 * na resData, de lá é extraído o token e este é armazenado no localStorage
 */
const resData = await response.json();
const token = resData.token;
localStorage.setItem('token', token);

/**então é criado uma nova pasta e um novo componente, auth.js, dentro é criada
 * a função abaixo para extrair esse token que foi guardado no localStorage
 */

export function getAuthToken(){
  const token=localStorage.getItem('token');
  return token;
};

/**Agora, nos componentes que precisam desse token, ou seja, onde o usuário precisa
 * estar autenticado, é inserida a seguinte lógica, como no EventDetail, onde
 * está o código para deletar o evento.
 */
//o token vai ser obtido através da função criada no componente auth.js
const token = getAuthToken();
  const response = await fetch('http://localhost:8080/events/' + eventId, {
    method: request.method,
    /**essa sintaxe está assim porque é exatamente a que o backend precisa */
    headers: {
      'Authorization':'Bearer ' + token
    }
  });

  /**Na aula 374 é inserida a lógica para mudar a UI de acordo com a existência
   * ou não de um token. 
   * Para isso, no componente MainNavigation.js, onde está a barra de itens
   * visíveis em todas as páginas, foi incluído o código abaixo.
   * o button está dentro de um Form para q seja submetido
   */
  <Form action='/logout' method='post'>
    <button>Logout</button>
  </Form>
  /**dentro da pasta pages foi criado o componente Logout.js
   * somente para guardar a função que exclui o token
   * do localstorage
   */
import { redirect } from "react-router-dom";

export function action() {
    localStorage.removeItem('token');
    return redirect('/');
}
/**já no App.js é incluída uma rota que não contém um
 * element e serve somente para dar acesso à função
 */
import {action as logoutAction } from './pages/Logout';
{
  path:'logout',
  action: logoutAction,
}
/**Aula 375 fala sobre usar o token para alterar a UI, ou seja, mostrar diferentes
 * opções se o usuário estiver logado ou não, para isso, no App.js é inserido o loader
 * que funciona como um userContext, compartilhando o acesso para todos os componentes 
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    loader: tokenLoader,
    id:"root",
  }
  /**Já no auth.js foi incluída a função em si */
  import {tokenLoader} from './util/auth';

  export function tokenLoader() {
    return getAuthToken();
}
/**então, nos componentes onde for usar o token é feita a seguinte lógica,
 * ele é importado, mirando no id da página.
 */
const token= useRouteLoaderData('root');
/**depois a lógica do item ser mostrado ou não caso haja ou não um token,
 * ou seja, se a pessoa está logada */
{!token && (<li>
  <NavLink to="/auth?mode=login"
    className={({ isActive }) => isActive ? classes.active : undefined}>
    Authentication
  </NavLink>
</li>)}
/**agora a lógica para proteger rotas que não devem ser acessadas se o usuário
 * não estiver logado. No auth (que controla a lógica das autenticações) foi incluída 
 * a função para pegar o token e redirecionar se não houver um, mesmo se for hardcode*/
export function checkAuthLoader(){
  const token = getAuthToken();

  if (!token) {
      return redirect("/auth");
  }}
/**então no App.js é incluído o loader */
{
  path: 'new',
  element: <NewEventPage />,
  action: manipulateEventAction,
  loader: checkAuthLoader,
},
/**Na aula 378 é incluído o código abaixo na página Roots
 * para que o caso não tenha token (não esteja logado), o código
 * dê um return, mas caso esteja, seja feito um submit, através
 * do hook useSubmit(), postando nulo no formulário que está
 * no /logout, ou seja, deslogando após uma hora (60 * 60 milisegundos)
 */
function RootLayout() {
  const token = useLoaderData();
  const submit = useSubmit();
  
  useEffect(()=> {
    if(!token) {
      return;
    }
    setTimeout(()=>{
      submit(null, {action: '/logout', method: 'post'})
    }, 1 * 60 *60 *1000);
  }, [token, submit]);
  /**A aula 379 vai corrigir uma falha do código, pois, no momento, se o usuário
   * fizer o login, e depois atualizar a página, a contagem vai reiniciar, para corrigir
   * isso é preciso um controle separado do tempo de login.
   * Para isso, primeiro, foi no Authentication.js onde está o controle para quando
   * o usuário se loga e é inserido o seguinte código:
   */
//esse código já estava antes é para inserir o token
  localStorage.setItem('token', token);
//essas duas linha a seguir usam funções built in do JS para criar uma hora no futuro
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  //já essa linha guarda essa hora no localStorage
  localStorage.setItem('expiration', expiration.toISOString());

  /**já no componente Auth.js é preciso uma função para determinar se o token
   * está expirado ou não:
   */
  export function getTokenDuration() {
    //essa linha vai buscar o tempo restante no localStorage
    const storedExpirationDate = localStorage.getItem('expiration');
    //essa linha vai criar uma nova data com base na informação acima
    const expirationDate = new Date(storedExpirationDate);
    //essa linha vai pegar a data atual
    const now = new Date();
    //essa vai diminuir a hora q falta para expirar da hora atual
    const duration = expirationDate.getTime() - now.getTime();
    return duration;
}
/**mais abaixo no código é chamada a função para falar q se a duração
 * do token, ou seja, o tempo restante - o tempo atual for < 0, vai retornar
 * a string EXPIRED
 */
const tokenDuration = getTokenDuration();

if (tokenDuration < 0) {
    return 'EXPIRED';
}

/**assim, essa lógica é usada no Root.js para atualizar a rota quando o tempo
 * tiver expirado, também é atualizado o código acima para utilizar no useEffect
 * não mais o tempo em milisegundos, mas o dessa lógica toda
 */
if(token === 'EXPIRED'){
  submit(null, {action: '/logout', method: 'post'});
  return; 
}

const tokenDuration = getTokenDuration();

setTimeout(()=>{
  submit(null, {action: '/logout', method: 'post'})
}, tokenDuration);
}, [token, submit]);