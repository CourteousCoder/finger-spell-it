{
  description = "A simple web-based flashcard-style game for practicing finger-spelling in American Sign Language";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils}:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          overlays = [];
          pkgs = import nixpkgs {
            inherit system overlays;
          };
        in
        with pkgs;
        {
          devShells.default = mkShell {
            buildInputs = [
                # System dev dependencies
                bash
                bashInteractive
                direnv
                eza
                fish
                fnm
                git
                gh
            ];
          shellHook = ''
            fnm use --corepack-enabled --install-if-missing --silent-if-unchanged
            corepack install
            pnpm install
          '';
          };
        }
      );
}