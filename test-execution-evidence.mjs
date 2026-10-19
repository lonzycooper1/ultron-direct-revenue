// Recognize test invocations without evaluating provider-returned shell text.
// Hosted command receipts include a shell wrapper even for a standalone test.
export function successfulTestExecution(receipt) {
 if (receipt.exitCode !== 0 || receipt.status !== 'completed') return false;
 let command = String(receipt.command || '').trim();
 const wrapped = command.match(/^(?:\/bin\/)?(?:bash|sh) -(?:lc|c) (['"])(.*)\1$/);
 if (wrapped) command = wrapped[2];
 // Reject chaining, substitutions, redirection, quoting and multiline scripts.
 if (/[^A-Za-z0-9_./ :=-]/.test(command)) return false;
 return /^(?:npm (?:run )?test|node --test|python(?:3)? -m (?:pytest|unittest))(?:\s|$)/.test(command);
}
