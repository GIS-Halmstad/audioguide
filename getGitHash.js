import { execSync } from "child_process";

// Fetch Git commit hash
const gitHash = execSync("git rev-parse --short HEAD").toString().trim();

// Export the Git commit hash
export default gitHash;
