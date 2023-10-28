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
    'Electronics': ['Funny.html','Uart-to-shell.html'],
};

const fileContents = {
    'Profile/whoami.html': 'uid=0(root) gid=0(root) groups=0(root)<br>My name is Matheus Gutierre, I am 17 years old, and I am passionate about hacking...<br><br>Please use: open whoami.html to view the full content.',
    'Hacking/Variavel_To_Rce.html': 'Unlike PHP, in Python, a variable (whether it\'s a string, float, or int), the vari...<br><br>Please use: open Variavel_To_Rce.html to view the full content.',
    'Electronics/Funny.html': 'Logic gates... <br><br>Please use: open Funny.html to view the full content.',
    'Electronics/Uart-to-shell.html': 'Getting a Root Shell on Router via UART... <br><br>Please use: open Uart-to-shell.html to view the full content.',
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
    const baseCommand = commandParts[0].toLowerCase();
    const options = commandParts.slice(1);

    switch (baseCommand) {
        case 'help':
            writeToTerminal('<br>' + 'Available commands:');
            writeToTerminal('<br>' + '- help: Displays this help menu');
            writeToTerminal('- clear: Clears the terminal');
            writeToTerminal('- ls: Lists files and directories');
            writeToTerminal('- cd: Accesses a directory');
            writeToTerminal('- cat: Displays part of the file content. However, you can view the entire file using the "open" command');
            writeToTerminal('- open: Redirects to the file you want to view, allowing you to see the formatted article');
            writeToTerminal('<br>' + 'Some commands have optional parameters.');
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
                    writeToTerminal(`Directory not found: ${currentDirectory}`);
                }
            } else {
                const contents = directoryContents[currentDirectory];
                if (contents) {
                    contents.forEach(item => {
                        writeToTerminal(item);
                    });
                } else {
                    writeToTerminal(`Directory not found: ${currentDirectory}`);
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
                writeToTerminal(`Directory not found: ${targetDirectory}`);
            }
            break;
            case 'cat':
                const targetFile = options[0];
                const filePath = currentDirectory + '/' + targetFile;
    
                if (fileContents[filePath]) {
                    writeToTerminal(fileContents[filePath]);
                } else {
                    writeToTerminal(`File not found: ${targetFile}`);
                }
                break;
                case 'open':
                    const openFileName = options[0];
                    const openFilePath = currentDirectory + '/' + openFileName;
                    const openFileContent = fileContents[openFilePath];
                    const redirectTo = `Post/${currentDirectory}/${openFileName}`;
                    
                    if (openFileContent !== undefined) {
                        writeToTerminal(`Redirect to: http://localhost/${redirectTo}`);
                        window.location.href = `../${redirectTo}`;
                    } else {
                        writeToTerminal(`File not found: ${currentDirectory}/${openFileName}`);
                    }
                    break;
            default:
                writeToTerminal('Invalid command, type "help" to see valid commands');
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
