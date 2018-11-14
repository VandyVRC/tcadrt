<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:html="http://www.w3.org/1999/xhtml"
    exclude-result-prefixes="xs"
    version="3.0">
    <xsl:output html-version="5"/>
    <xsl:template match="/">
        <html:html>
            <xsl:apply-templates/>
        </html:html> 
    </xsl:template>
    <xsl:template match="tei:titleStmt">
        <html:title><xsl:apply-templates/></html:title>  
    </xsl:template>
    <xsl:template match="tei:teiHeader">
        <html:head><xsl:apply-templates/></html:head>
    </xsl:template>
    <xsl:template match="tei:text">
        <html:body><xsl:apply-templates/></html:body>
    </xsl:template>
</xsl:stylesheet>