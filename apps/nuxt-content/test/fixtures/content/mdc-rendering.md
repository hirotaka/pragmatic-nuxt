---
title: MDC rendering contract
description: Temporary content for Markdown component regression tests.
---

## Previews

::code-preview
  :::callout{title="Fixture note"}
  A **formatted** description with inline `code`.
  :::

#code
```mdc
::callout{title="Fixture note"}
A **formatted** description with inline `code`.
::
```
::

::code-preview{label="Fixture preview"}
  :::badge
  **Fixture badge**
  :::

#code
```mdc
::badge
**Fixture badge**
::
```
::

::note{to="/docs/mdc-navigation"}
Follow the documentation link.
::

## Card examples

::picture-and-text{data-testid="first-card"}
---
card: true
---
**First card** body.

#image
![First card illustration](https://images.example.test/first.svg){width="800" height="400"}
::

::picture-and-text{data-testid="second-card"}
---
card: true
---
**Second card** body.

#image
![Second card illustration](https://images.example.test/second.svg){width="800" height="400"}
::

## Image geometry

![Standalone illustration](https://images.example.test/geometry/standalone.svg){width="1200" height="630" loading="eager"}

![Thumbnail illustration](https://images.example.test/geometry/thumbnail.svg){width="286" height="150" loading="lazy"}

::pictures
![Wide illustration](https://images.example.test/geometry/wide.svg){width="1200" height="400" loading="lazy"}
![Square illustration](https://images.example.test/geometry/square.svg){width="400" height="400" loading="lazy"}
![Landscape illustration](https://images.example.test/geometry/landscape.svg){width="600" height="300" loading="lazy"}
::
