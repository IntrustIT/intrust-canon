# Reference component implementations

These files are **not** imported by Intrust apps at runtime. They're reference implementations of the patterns described in `../memory/*.md`.

Each consumer app keeps its own copy of these components in its own `components/` directory and is responsible for matching the canon. The canon docs (`memory/*.md`) are the authoritative spec; this directory is a concrete example.

If you spot a divergence between a consumer's component and the spec here, fix it in the consumer (and update this reference if the new behavior is the intended canon going forward).
