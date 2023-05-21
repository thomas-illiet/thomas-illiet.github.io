---
layout: post
date: 2023-05-21
title: Declaring InternalsVisibleTo in the csproj
header: /banner/automation-banner-01.png
tags:
  - .NET
categories:
  - development
---

While I prefer testing the public API of an assembly, it's sometimes useful to test the implementation details.

Starting with .NET 5, you can use the <InternalsVisibleTo> without adding any NuGet package:
  
```csharp
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <InternalsVisibleTo Include="$(AssemblyName).Tests" />
  </ItemGroup>
</Project>
```
