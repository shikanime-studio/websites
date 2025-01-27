{
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
              "prettier-plugin-astro"
              "prettier-plugin-tailwindcss"
            ];
          };
          shfmt.enable = true;
          statix.enable = true;
          taplo.enable = true;
          terraform.enable = true;
        };
        settings.global.excludes = [
          "*.ico"
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
            npm = {
              enable = true;
              install.enable = true;
            };
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
      };
    };
}
