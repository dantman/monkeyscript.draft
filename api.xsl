<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fn="http://www.w3.org/2005/02/xpath-functions">
<xsl:variable name="path" select="/api/@path"/>
<xsl:variable name="namespace" select="/api/namespace/text()"/>
<xsl:variable name="class" select="/api/class/text()"/>
<xsl:variable name="instance" select="/api/class/@instance"/>
<xsl:template match="/api">
<html>
	<head>
		<title><xsl:value-of select="$namespace"/>.<xsl:value-of select="$class"/></title>
		
		<link rel="stylesheet" type="text/css" href="{$path}/api.css"/>
		<link rel="stylesheet" type="text/css" href="{$path}/prettify/prettify.css"/>
		<script type="text/javascript" src="{$path}/prettify/prettify.js"/>
		<script type="text/javascript" src="{$path}/jquery-1.3.2.min.js"/>
		<script type="text/javascript" src="{$path}/api.js"/>
	</head>
	<body>
		<div id="root">
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
				<xsl:if test="/api/implements">
				<h4>Implements</h4>
				<ul>
				<xsl:for-each select="/api/implements">
					<li><a href="{$path}/{text()}.xml"><xsl:value-of select="."/></a></li>
				</xsl:for-each>
				</ul>
				</xsl:if>
				<xsl:apply-templates select="construct"/>
				<xsl:apply-templates select="static"/>
				<xsl:apply-templates select="properties"/>
				<xsl:apply-templates select="methods"/>
			</article>
		</div>
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
		<xsl:apply-templates select="call"><xsl:with-param name="mode" select="'class'"/></xsl:apply-templates>
	</section>
</xsl:template>
<xsl:template match="properties">
	<section id="properties">
		<h3>Instance properties</h3>
		<xsl:apply-templates select="call"><xsl:with-param name="mode" select="'instance'"/></xsl:apply-templates>
	</section>
</xsl:template>
<xsl:template match="methods">
	<section id="methods">
		<h3>Instance methods</h3>
		<xsl:apply-templates select="call"><xsl:with-param name="mode" select="'instance'"/></xsl:apply-templates>
	</section>
</xsl:template>
<xsl:template match="call">
	<xsl:param name="mode"/>
	<section id="{name(..)}-{name}" class="call">
		<h4>
			<xsl:value-of select="name"/>
			<xsl:if test="name/@status = 'pending'"><span class="pending">(pending name)</span></xsl:if>
			<xsl:choose>
				<xsl:when test="@implementation = 'native'"><span class="impl-native">(implemented natively)</span></xsl:when>
				<xsl:when test="@implementation = 'js'"><span class="impl-js">(implemented in JavaScript)</span></xsl:when>
			</xsl:choose>
			<xsl:if test="@level = 'internal'"><span class="internal">(internal)</span></xsl:if>
		</h4>
		<div>
			<xsl:if test="alias">
			<label>Aliases:
				<span class="aliases"><xsl:for-each select="alias"><xsl:if test="position() &gt; 1">, </xsl:if><xsl:value-of select="."/></xsl:for-each></span>
			</label>
			</xsl:if>
			<ul>
			<xsl:apply-templates select="form"><xsl:with-param name="mode" select="$mode"/></xsl:apply-templates>
			</ul>
			<div><xsl:apply-templates select="explain"/></div>
			<xsl:if test="source">
				<h5>Source</h5>
				<pre class="prettyprint lang-js"><xsl:apply-templates select="source"/></pre>
			</xsl:if>
		</div>
	</section>
</xsl:template>
<xsl:template match="form">
	<xsl:param name="mode"/>
	<li><pre class="prettyprint lang-js">
	<xsl:if test="@mode">
	<xsl:choose>
		<xsl:when test="$mode = 'class'"><xsl:value-of select="$class"/>.</xsl:when>
		<xsl:when test="$mode = 'instance'"><xsl:value-of select="$instance"/>.</xsl:when>
	</xsl:choose>
	</xsl:if>
	<xsl:choose>
		<xsl:when test="@mode = 'call'"><xsl:value-of select="../name"/>(<xsl:value-of select="."/>);</xsl:when>
		<xsl:when test="@mode = 'get'"><xsl:value-of select="../name"/>;</xsl:when>
		<xsl:when test="@mode = 'set'"><xsl:value-of select="../name"/> = <xsl:value-of select="."/>;</xsl:when>
		<xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
	</xsl:choose></pre></li>
</xsl:template>
<xsl:template match="//explain//*"><xsl:element name="{name()}"><xsl:apply-templates/></xsl:element></xsl:template>
<xsl:template match="//explain//*[@link]"><a href="{@link}"><xsl:element name="{name()}"><xsl:apply-templates/></xsl:element></a></xsl:template>
<xsl:template match="//explain//link"><a href="{$path}/{@to}"><xsl:apply-templates/></a></xsl:template>
</xsl:stylesheet>
