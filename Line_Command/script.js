const outputElement = document.getElementById('output');
const inputElement = document.getElementById('input');

inputElement.addEventListener('blur', () => {
    inputElement.focus();
});

const promptText = '<br>'+'(gutierre0x80@OldSystem)-[';
let currentDirectory = '/';
let isFirstCommand = true;

const directoryContents = {
    '/': ['Profile', 'Hacking', 'Electronics'],
    'Profile': ['whoami.html'],
    'Hacking': ['Variavel_To_Rce.html'],
    'Electronics': ['Sorry.txt'],
};

const fileContents = {
    'Profile/whoami.html': 'uid=0(root) gid=0(root) groups=0(root)<br>Meu nome é Matheus Gutierre, tenho 17 anos e sou apaixonado por Hac...<br><br>Por favor, para ver o conteudo completo, utilize: open whoami.txt',
    'Hacking/Variavel_To_Rce.html': 'Diferente do PHP, no python, uma váriavel (Seja string, float ou int), as variá...<br><br>Por favor, para ver o conteudo completo, utilize: open whoami.txt',
    'Electronics/Sorry.txt': 'Sorry, this file is empty',
};

function hideWelcomeText() {
    if (isFirstCommand) {
        outputElement.innerHTML = '';
        isFirstCommand = false;
    }
}

function writeToTerminal(text, isNewLine = true) {
    if (isNewLine) {
        outputElement.innerHTML += '<br>';
    }
    outputElement.innerHTML += text;
    outputElement.scrollTop = outputElement.scrollHeight;
}

function handleCommand(command) {

    const sanitizedCommand = DOMPurify.sanitize(command, { ALLOWED_TAGS: [] });

    hideWelcomeText();
    writeToTerminal(`${promptText}${currentDirectory}]: ${sanitizedCommand}`, true);

    const commandParts = sanitizedCommand.split(' ');
    const baseCommand = commandParts[0];
    const options = commandParts.slice(1);

    switch (baseCommand) {
        case 'help':
            writeToTerminal('<br>'+'Comandos disponíveis:');
            writeToTerminal('<br>'+'- help: Mostra este menu de ajuda');
            writeToTerminal('- clear: Limpa o terminal');
            writeToTerminal('- ls: Lista os arquivos e diretórios');
            writeToTerminal('- cd: Acessa um diretório');
            writeToTerminal('- cat: Exibe parte do conteudo do arquivo, contudo, é possível ver o arquivo inteiro usando o comando "open"');
            writeToTerminal('- open: É redirecionado para o arquivo que deseja ver, assim poderá ver o artigo formatado');
            writeToTerminal('<br>'+'Alguns comandos possuem parâmetros opcionais.');
            break;
        case 'clear':
            outputElement.innerHTML = '';
            break;
        case 'ls':
            if (options.includes('-la') || options.includes('-al')) {
                const contents = directoryContents[currentDirectory];
                if (contents) {
                    contents.forEach(item => {
                        const details = 'drwxr-xr-x  2 gutierre0x80 gutierre0x80  4096 Aug 23 18:44';
                        writeToTerminal(details + ' ' + item);
                    });
                } else {
                    writeToTerminal(`Diretório não encontrado: ${currentDirectory}`);
                }
            } else {
                const contents = directoryContents[currentDirectory];
                if (contents) {
                    contents.forEach(item => {
                        writeToTerminal(item);
                    });
                } else {
                    writeToTerminal(`Diretório não encontrado: ${currentDirectory}`);
                }
            }
            break;
        case 'cd':
            const targetDirectory = options[0];

            if (targetDirectory === '..' || targetDirectory === '../' || targetDirectory === '/') {
                // Lidar com voltar para o diretório pai ou ir para o diretório raiz
                currentDirectory = '/';
                writeToTerminal(`(gutierre0x80@OldSystem)-[${currentDirectory}]`);
            } else if (directoryContents[targetDirectory]) {
                // Verificar se o diretório alvo existe nos diretórios disponíveis
                currentDirectory = targetDirectory;
                writeToTerminal(`(gutierre0x80@OldSystem)-[${currentDirectory}]`);
            } else {
                writeToTerminal(`Diretório não encontrado: ${targetDirectory}`);
            }
            break;
            case 'cat':
                const targetFile = options[0];
                const filePath = currentDirectory + '/' + targetFile;
    
                if (fileContents[filePath]) {
                    writeToTerminal(fileContents[filePath]);
                } else {
                    writeToTerminal(`Arquivo não encontrado: ${targetFile}`);
                }
                break;
                case 'open':
                    const openFileName = options[0];
                    const openFilePath = currentDirectory + '/' + openFileName;
                    const openFileContent = fileContents[openFilePath];
                    const redirectTo = `Post/${currentDirectory}/${openFileName}`;
                    
                    if (openFileContent !== undefined) {
                        writeToTerminal(`Redirecionando para: http://localhost/${redirectTo}`);
                        window.location.href = `../${redirectTo}`;
                    } else {
                        writeToTerminal(`Arquivo não encontrado: ${currentDirectory}/${openFileName}`);
                    }
                    break;
            default:
                writeToTerminal('Comando inválido, digite "help" para ver os comandos válidos');
                break;
        }
    }
    
    inputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const command = inputElement.value.trim();
            inputElement.value = '';
            handleCommand(command);
        }
    });
