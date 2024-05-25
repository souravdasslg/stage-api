#!/usr/bin/env node
import { CliCore } from "@tsed/cli-core";
import { config } from "../config";
import { Seed } from "./seed";

CliCore.bootstrap({
  ...config,
  commands: [Seed]
}).catch(console.error);
