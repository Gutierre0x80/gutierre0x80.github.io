const outputElement = document.getElementById('output');
const inputElement = document.getElementById('input');

inputElement.addEventListener('blur', () => {
    inputElement.focus();
});

const promptText = '<br>'+'(gutierre0x80@OldSystem)-[';
let currentDirectory = '/';
let isFirstCommand = true;

const directoryContents = {
    '/': ['profile', 'hacking', 'electronics'],
    'profile': ['whoami.html'],
    'hacking': ['variavel_to_rce.html'],
    'electronics': ['funny.html', 'uart_to_shell.html'],
};

const fileContents = {
    'profile/whoami.html': 'uid=0(root) gid=0(root) groups=0(root)<br>Meu nome é Matheus Gutierre, tenho 17 anos e sou apaixonado por Hac...<br><br>Por favor, para ver o conteudo completo, utilize: open whoami.html',
    'hacking/variavel_to_rce.html': 'Diferente do PHP, no python, uma váriavel (Seja string, float ou int), as variá...<br><br>Por favor, para ver o conteudo completo, utilize: open variavel_to_rce.html',
    'electronics/funny.html': 'Portas logicas... <br><br>Por favor, para ver o conteudo completo, utilize: open Funny.html',
    'electronics/uart_to_shell.html': 'Getting a Root Shell on Router via UART... <br><br>Por favor, para ver o conteudo completo, utilize: open Uart-to-shell.html',
};

const comandosDisponiveis = ['help', 'clear', 'ls', 'cd', 'cat', 'open'];
const todosOsNomes = [...comandosDisponiveis, ...Object.keys(directoryContents).map(item => item.toLowerCase())];

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
    const baseCommand = commandParts[0].toLowerCase();
    const options = commandParts.slice(1).map(option => option.toLowerCase());

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
                currentDirectory = '/';
                writeToTerminal(`(gutierre0x80@OldSystem)-[${currentDirectory}]`);
            } else if (directoryContents[targetDirectory]) {
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
                    const redirectTo = `Post/${currentDirectory.charAt(0).toUpperCase() + currentDirectory.slice(1)}/${openFileName}`;
                    
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
    function startsWithIgnoreCase(str, prefix) {
        return str.toLowerCase().startsWith(prefix.toLowerCase());
    }
    
    inputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = inputElement.value.trim();
            inputElement.value = '';
            handleCommand(command);
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const currentInput = inputElement.value.trim();
            const commandParts = currentInput.split(' ');
            const baseCommand = commandParts[0].toLowerCase();
    
            if (baseCommand === 'cd') {
                const matchingDirectories = Object.keys(directoryContents).filter(directory => startsWithIgnoreCase(directory, commandParts[1]));
                if (matchingDirectories.length === 1) {
                    inputElement.value = `cd ${matchingDirectories[0]}`;
                } else if (matchingDirectories.length > 1) {
                    writeToTerminal('<br>' + matchingDirectories.join(', '));
                }
            } else if (baseCommand === 'cat' || baseCommand === 'open') {
                const currentDirectoryContents = directoryContents[currentDirectory];
                if (currentDirectoryContents) {
                    const matchingFiles = currentDirectoryContents.filter(file => startsWithIgnoreCase(file, commandParts[1]));
                    if (matchingFiles.length === 1) {
                        inputElement.value = `${baseCommand} ${matchingFiles[0]}`;
                    } else if (matchingFiles.length > 1) {
                        writeToTerminal('<br>' + matchingFiles.join(', '));
                    }
                }
            } else {
                const matchingCommands = comandosDisponiveis.filter(cmd => startsWithIgnoreCase(cmd, currentInput));
                if (matchingCommands.length === 1) {
                    inputElement.value = matchingCommands[0];
                } else if (matchingCommands.length > 1) {
                    writeToTerminal('<br>' + matchingCommands.join(', '));
                }
            }
        }
    });
    
    
