{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # With unfree pacakges
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            allowBroken = true;
          };
        };
      in
      {
        formatter = pkgs.nixpkgs-fmt;
        devShell = pkgs.mkShell {
          shellHook = ''
            export COREPACK_DIR=$HOME/.local/share/corepack
            mkdir -p $COREPACK_DIR
            corepack enable --install-directory $COREPACK_DIR
            PATH=$COREPACK_DIR:$PATH
          '';
          buildInputs = with pkgs; [
            nodejs_20
            ngrok
          ];
        };
      }
    );
}
