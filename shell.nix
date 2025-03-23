{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    coreutils
    direnv
    git
    just
    nix-direnv
  ];
}
