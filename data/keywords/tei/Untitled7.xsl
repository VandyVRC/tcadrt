<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:html="http://www.w3.org/1999/xhtml" exclude-result-prefixes="xs" version="3.0">
    <xsl:output method="html" html-version="5" indent="yes" omit-xml-declaration="yes"/>
    
    <xsl:template match="/">
        <html:html>
            <xsl:apply-templates/>
        </html:html>
    </xsl:template>
    
    <xsl:template match="tei:teiHeader">
        <html:head>
            <xsl:apply-templates/>
        </html:head>
    </xsl:template>
    
    <xsl:template match="tei:text">
        <html:body>
            <xsl:apply-templates/>
        </html:body>
    </xsl:template>
    
    <xsl:template match="tei:titleStmt">
        <html:title>
            <xsl:value-of select="tei:title"/> by <xsl:value-of select="tei:author"/>
        </html:title>
    </xsl:template>
    
    <xsl:template match="tei:publicationStmt">
        <html:meta>
            <xsl:attribute name="name">description</xsl:attribute>
            <xsl:attribute name="content">This poem was published by the <xsl:value-of
                select="tei:publisher"/> in <xsl:value-of select="tei:pubPlace"/> on
                <xsl:value-of select="format-date(tei:date, '[MNn] [D01], [Y0001]')"
                /></xsl:attribute>
        </html:meta>
    </xsl:template>
    
    <xsl:template match="tei:sourceDesc">
        <html:meta>
            <xsl:attribute name="name">source</xsl:attribute>
            <xsl:attribute name="content">
                <xsl:value-of select="tei:p"/>
            </xsl:attribute>
        </html:meta>
    </xsl:template>
    
    <xsl:template match="tei:head">
        <html:h2>
            <xsl:apply-templates/>
        </html:h2>
    </xsl:template>
    
    <xsl:template match="tei:lg">
        <xsl:choose>
            <xsl:when test="@type = 'stanza'">
                <html:div>
                    <xsl:apply-templates/>
                </html:div>
            </xsl:when>
            <xsl:otherwise>
                <html:p>
                    <xsl:apply-templates/>
                </html:p>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="tei:l">
        <xsl:apply-templates/>
        <html:br/>
    </xsl:template>
    
</xsl:stylesheet>