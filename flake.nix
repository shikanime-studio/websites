{
  inputs = {
    devenv.url = "github:cachix/devenv";
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  nixConfig = {
    extra-public-keys = [
      "shikanime.cachix.org-1:OrpjVTH6RzYf2R97IqcTWdLRejF6+XbpFNNZJxKG8Ts="
      "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw="
    ];
    extra-substituters = [
      "https://shikanime.cachix.org"
      "https://devenv.cachix.org"
    ];
  };

  outputs =
    inputs@{
      devenv,
      flake-parts,
      treefmt-nix,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        devenv.flakeModule
        treefmt-nix.flakeModule
      ];
      perSystem =
        { pkgs, ... }:
        {
          treefmt = {
            projectRootFile = "flake.nix";
            enableDefaultExcludes = true;
            programs = {
              actionlint.enable = true;
              hclfmt.enable = true;
              nixfmt.enable = true;
              prettier = {
                enable = true;
                includes = [
                  "*.astro"
                  "*.js"
                  "*.json"
                  "*.jsx"
                  "*.md"
                  "*.mjs"
                  "*.ts"
                  "*.tsx"
                  "*.webmanifest"
                  "*.xml"
                  "*.yaml"
                ];
                settings.plugins = [
                  "@prettier/plugin-xml"
                  "@trivago/prettier-plugin-sort-imports"
                  "prettier-plugin-astro"
                  "prettier-plugin-tailwindcss"
                ];
              };
              shfmt.enable = true;
              sqlfluff = {
                enable = true;
                dialect = "sqlite";
              };
              statix.enable = true;
              taplo.enable = true;
              terraform.enable = true;
            };
            settings.global.excludes = [
              "*.gif"
              "*.ico"
              "*.jpg"
              "*.png"
              "*.svg"
              "*.txt"
              "*.webp"
              "**/node_modules"
            ];
          };
          devenv.shells.default = {
            containers = pkgs.lib.mkForce { };
            languages = {
              opentofu.enable = true;
              nix.enable = true;
              javascript = {
                enable = true;
                corepack.enable = true;
              };
            };
            cachix = {
              enable = true;
              push = "shikanime";
            };
            git-hooks.hooks = {
              deadnix.enable = true;
              denolint.enable = true;
              flake-checker.enable = true;
              shellcheck.enable = true;
              tflint.enable = true;
            };
            packages = [
              pkgs.gitnr
            ];
          };
        };
      systems = [
        "x86_64-linux"
        "x86_64-darwin"
        "aarch64-linux"
        "aarch64-darwin"
      ];
    };
}
