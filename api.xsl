<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fn="http://www.w3.org/2005/02/xpath-functions">
<xsl:variable name="namespace" select="/api/namespace/text()"/>
<xsl:variable name="class" select="/api/class/text()"/>
<xsl:variable name="instance" select="/api/class/@instance"/>
<xsl:template match="/api">
<html>
	<head>
		<title><xsl:value-of select="$namespace"/>.<xsl:value-of select="$class"/></title>
		
		<link rel="stylesheet" type="text/css" href="api.css"/>
		<link rel="stylesheet" type="text/css" href="prettify/prettify.css"/>
		<script type="text/javascript" src="prettify/prettify.js"/>
		<script type="text/javascript" src="jquery-1.3.2.min.js"/>
		<script type="text/javascript" src="api.js"/>
	</head>
	<body>
		<nav id="toc">
			<li><a href="#construct">construction</a></li>
			<h3>Static methods</h3>
			<ul>
			<xsl:for-each select="/api/static/call">
				<li><a href="#static-{name}"><xsl:value-of select="name"/></a></li>
			</xsl:for-each>
			</ul>
			<h3>Instance properties</h3>
			<ul>
			<xsl:for-each select="/api/properties/call">
				<li><a href="#properties-{name}"><xsl:value-of select="name"/></a></li>
			</xsl:for-each>
			</ul>
			<h3>Instance methods</h3>
			<ul>
			<xsl:for-each select="/api/methods/call">
				<li><a href="#methods-{name}"><xsl:value-of select="name"/></a></li>
			</xsl:for-each>
			</ul>
		</nav>
		<article>
			<xsl:apply-templates select="construct"/>
			<xsl:apply-templates select="static"/>
			<xsl:apply-templates select="properties"/>
			<xsl:apply-templates select="methods"/>
		</article>
	</body>
</html>
</xsl:template>
<xsl:template match="construct">
	<section id="construct">
		<h3>Construct</h3>
		<div>
		<ul>
		<xsl:for-each select="form">
			<li><pre class="prettyprint lang-js"><xsl:value-of select="."/></pre></li>
		</xsl:for-each>
		</ul>
		<div><xsl:apply-templates select="explain"/></div>
		</div>
	</section>
</xsl:template>
<xsl:template match="static">
	<section id="static">
		<h3>Static methods</h3>
		<xsl:apply-templates select="call"/>
	</section>
</xsl:template>
<xsl:template match="properties">
	<section id="properties">
		<h3>Instance properties</h3>
		<xsl:apply-templates select="call"/>
	</section>
</xsl:template>
<xsl:template match="methods">
	<section id="methods">
		<h3>Instance methods</h3>
		<xsl:apply-templates select="call"/>
	</section>
</xsl:template>
<xsl:template match="call">
	<section id="{name(..)}-{name}" class="call">
		<h4><xsl:value-of select="name"/></h4>
		<div>
			<ul>
			<xsl:apply-templates select="form"/>
			</ul>
			<div><xsl:apply-templates select="explain"/></div>
			<h5>Source</h5>
			<pre class="prettyprint lang-js"><xsl:apply-templates select="source"/></pre>
		</div>
	</section>
</xsl:template>
<xsl:template match="form">
<li><pre class="prettyprint lang-js">
	<xsl:choose>
		<xsl:when test="@mode = 'call'">
			<xsl:value-of select="$class"/>.<xsl:value-of select="../name"/>(<xsl:value-of select="."/>);</xsl:when>
		<xsl:when test="@mode = 'get'">
			<xsl:value-of select="$instance"/>.<xsl:value-of select="../name"/>;</xsl:when>
		<xsl:when test="@mode = 'set'">
			<xsl:value-of select="$instance"/>.<xsl:value-of select="../name"/> = <xsl:value-of select="."/>;</xsl:when>
	</xsl:choose></pre></li>
</xsl:template>
<xsl:template match="//explain//*"><xsl:element name="{name()}"><xsl:value-of select="."/></xsl:element></xsl:template>
</xsl:stylesheet>
