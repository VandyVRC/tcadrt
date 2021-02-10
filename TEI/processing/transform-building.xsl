<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="http://www.tei-c.org/release/xml/tei/custom/schema/relaxng/tei_all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" 
    exclude-result-prefixes="xs syriaca functx saxon" version="2.0" 
    xmlns:tei="http://www.tei-c.org/ns/1.0" 
    xmlns:syriaca="http://syriaca.org"
    xmlns:saxon="http://saxon.sf.net/" 
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" 
    xmlns:functx="http://www.functx.com">
        
    <xsl:output encoding="UTF-8" indent="yes" method="xml" name="xml" />
   
    <xsl:function name="syriaca:normalizeYear" as="xs:string">
        <!-- The spreadsheet presents years normally, but datable attributes need 4-digit years -->
        <xsl:param name="year" as="xs:string"/>
        <xsl:choose>
            <xsl:when test="starts-with($year,'-')">
                <xsl:value-of select="concat('-',syriaca:normalizeYear(substring($year,2)))"></xsl:value-of>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="string-length($year) &gt; 3">
                        <xsl:value-of select="$year"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="syriaca:normalizeYear(concat('0',$year))"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <xsl:function name="syriaca:custom-dates" as="xs:date">
        <xsl:param name="date" as="xs:string"/>
        <xsl:variable name="trim-date" select="normalize-space($date)"/>
        <xsl:choose>
            <xsl:when test="starts-with($trim-date,'0000') and string-length($trim-date) eq 4"><xsl:text>0001-01-01</xsl:text></xsl:when>
            <xsl:when test="string-length($trim-date) eq 4"><xsl:value-of select="concat($trim-date,'-01-01')"/></xsl:when>
            <xsl:when test="string-length($trim-date) eq 5"><xsl:value-of select="concat($trim-date,'-01-01')"/></xsl:when>
            <xsl:when test="string-length($trim-date) eq 5"><xsl:value-of select="concat($trim-date,'-01-01')"/></xsl:when>
            <xsl:when test="string-length($trim-date) eq 7"><xsl:value-of select="concat($trim-date,'-01')"/></xsl:when>
            <xsl:when test="string-length($trim-date) eq 3"><xsl:value-of select="concat('0',$trim-date,'-01-01')"/></xsl:when>
            <xsl:when test="string-length($trim-date) eq 2"><xsl:value-of select="concat('00',$trim-date,'-01-01')"/></xsl:when>
            <xsl:when test="string-length($trim-date) eq 1"><xsl:value-of select="concat('000',$trim-date,'-01-01')"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="$trim-date"/></xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <xsl:template match="/root">
        <xsl:for-each select="row">
        <xsl:variable name="folder-id" select="work_building_identifier | built_work_site_primary_key"/>
        <xsl:variable name="record-title" select="site_name_pinyin | building_name_pinyin"/>
        <xsl:variable name="base-uri" select="'http://tcadrt.org/place/'"></xsl:variable>    
        <xsl:variable name="filename" select="concat('../data/places/buildings/tei/',$folder-id,'.xml')"/>   
        <xsl:result-document href="{$filename}" format="xml">    
            <!-- adds the xml-model instruction with the link to the Syriaca.org validator -->
            <xsl:processing-instruction name="xml-model">
                <xsl:text>href="http://syriaca.org/documentation/syriaca-tei-main.rnc" type="application/relax-ng-compact-syntax"</xsl:text>
            </xsl:processing-instruction>
            <TEI xmlns="http://www.tei-c.org/ns/1.0">
                <xsl:call-template name="header">
                    <xsl:with-param name="record-id" select="$folder-id"/>
                    <xsl:with-param name="record-title" select="$record-title"/>
                </xsl:call-template>
                <text>
                    <body>
                        <listPlace>
                            <place xml:id="place-{$folder-id}">
                                <xsl:attribute name="type">
                                    <xsl:choose>
                                        <xsl:when test="building_name_pinyin != ''">building</xsl:when>
                                        <xsl:otherwise>site</xsl:otherwise>
                                    </xsl:choose>
                                </xsl:attribute>
                                <!-- Main building name -->
                                <!-- NOTE: need xml:lang code for pinyin -->
                                <xsl:for-each select="building_name_pinyin[. != '']">    
                                    <placeName xml:id="name{$folder-id}-1" type="building-name"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="building_name2_traditional[. != '']">    
                                    <placeName xml:id="name{$folder-id}-2" type="building-name" xml:lang="zh-Hant"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="building_name3_simplified[. != '']">    
                                    <placeName xml:id="name{$folder-id}-3" type="building-name" xml:lang="zh-Hans"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="building_name_in_site[. != '']">    
                                    <placeName xml:id="name{$folder-id}-4" type="alternate" subtype="building-name-in-site" xml:lang="en"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="building_in_site2_traditional[. != '']">    
                                    <placeName xml:id="name{$folder-id}-5" type="alternate" subtype="building-name-in-site" xml:lang="zh-Hant"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="building_in_site3_simplified[. != '']">    
                                    <placeName xml:id="name{$folder-id}-6" type="alternate" subtype="building-name-in-site" xml:lang="zh-Hans"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="building_name_en[. != '']">    
                                    <placeName xml:id="name{$folder-id}-7" xml:lang="en"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="alternate_site_name_pinyin[. != '']">    
                                    <placeName xml:id="name{$folder-id}-8" type="alternate" subtype="site-name"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                <xsl:for-each select="alternate_site_name_traditional[. != '']">    
                                    <placeName xml:id="name{$folder-id}-9" type="alternate" subtype="site-name" xml:lang="zh-Hant"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>    
                                <xsl:for-each select="alternate_site_name_simplified[. != '']">    
                                    <placeName xml:id="name{$folder-id}-10" type="alternate" subtype="site-name" xml:lang="zh-Hans"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>   
                                
                                <xsl:for-each select="alternate_building_name_pinyin[. != '']">    
                                    <placeName xml:id="name{$folder-id}-11" type="alternate"><xsl:value-of select="."/></placeName>    
                                </xsl:for-each>
                                
                                <xsl:for-each select="site_data[. != '']">
                                    <desc type="site-data"><xsl:value-of select="."/></desc>
                                </xsl:for-each>
                                <xsl:for-each select="building_data[. != '']">
                                    <desc type="building_data"><xsl:value-of select="."/></desc>
                                </xsl:for-each>
                                
                                <idno type="URI"><xsl:value-of select="concat($base-uri,'/',$folder-id)"/></idno>
                                <xsl:for-each select="building_date[. != '']">
                                    <state type="existence">
                                        <xsl:if test="building_start[. != '']">
                                            <xsl:attribute name="from"><xsl:value-of select="."/></xsl:attribute>
                                        </xsl:if>
                                        <xsl:if test="building_end[. != '']">
                                            <xsl:attribute name="to"><xsl:value-of select="."/></xsl:attribute>
                                        </xsl:if>
                                        <xsl:if test="building_start[. != '']">
                                            <precision match="@from" notBefore="{building_start}"/>
                                        </xsl:if>
                                        <xsl:if test="building_end[. != '']">
                                            <precision match="@to" notAfter="{building_end}"/>
                                        </xsl:if>
                                    </state>
                                </xsl:for-each>
                                <xsl:if test="decimal_latitude[. != '']">
                                    <location type="gps">
                                        <geo><xsl:value-of select="concat(decimal_latitude,' ',decimal_longitude)"></xsl:value-of></geo>
                                    </location>
                                </xsl:if>
                                <xsl:if test="verbatim_latitude[. != '']">
                                    <location type="verbatim">
                                        <note><xsl:value-of select="concat(verbatim_latitude,' ',verbatim_longitude)"></xsl:value-of></note>
                                    </location>
                                </xsl:if>
                                <xsl:for-each select="comments_and_field_notes[. != '']">
                                    <note type="field-notes"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="notes[. != '']">
                                    <note type="notes"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="most_recent_doc[. != '']">
                                    <note type="most_recent_doc"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="ct_angled_bracket_arm[. != '']">
                                    <note type="ct_angled_bracket_arm"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="corner_angled_bracket_arm[. != '']">
                                    <note type="corner_angled_bracket_arm"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="ic_angled_bracket_arm[. != '']">
                                    <note type="ic_angled_bracket_arm"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="ic_match_ct[. != '']">
                                    <note type="ic_match_ct"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="number_of_ic_in_central_bay[. != '']">
                                    <note type="number_of_ic_in_central_bay"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="pupaifang[. != '']">
                                    <note type="pupaifang"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="first_step_touxin[. != '']">
                                    <note type="first_step_touxin"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="first_step_jixin[. != '']">
                                    <note type="first_step_jixin"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="cejiao[. != '']">
                                    <note type="cejiao"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="pizhu_xiaang[. != '']">
                                    <note type="pizhu_xiaang"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="qinmian_xiaang[. != '']">
                                    <note type="qinmian_xiaang"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="number_of_xiaang[. != '']">
                                    <note type="number_of_xiaang"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="ang-shaped_shuatou[. != '']">
                                    <note type="ang-shaped_shuatou"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="beveled_linggong[. != '']">
                                    <note type="beveled_linggong"><xsl:value-of select="."/></note>
                                </xsl:for-each>
                                <xsl:for-each select="chamfered_linggong[. != '']">
                                    <note type="chamfered_linggong"><xsl:value-of select="."/></note>
                                </xsl:for-each>     
                            </place>
                            <xsl:if test="built_work_site_foreign_key != ''">
                                <relation name="contained" active="{concat($base-uri,built_work_site_foreign_key)}" passive="{concat($base-uri,$folder-id)}"/>    
                            </xsl:if>
                        </listPlace>
                    </body>
                </text>
                </TEI>
            </xsl:result-document>
        </xsl:for-each>     
    </xsl:template>
    
    <xsl:template name="header" xmlns="http://www.tei-c.org/ns/1.0">
        <xsl:param name="record-id"/>
        <xsl:param name="record-title"/>
        <xsl:param name="bib-ids"/>
        <teiHeader>
            <fileDesc>
                <titleStmt>
                    <title level="a"><xsl:value-of select="$record-title"/></title>
                    <title level="m">Traditional Chinese Architecture Digital Research Tool</title>
                    <!--
                    <sponsor></sponsor>
                    <funder></funder>
                    -->
                    <principal>Tracy Miller</principal>
                    <!-- Iron out editors -->
                    <editor role="creator">Tracy Miller</editor>
                    <!-- Iron out rsp statements--> 
                    <respStmt>
                        <resp>Editing, proofreading, data entry and revision by</resp>
                        <name type="person">Tracy Miller</name>
                    </respStmt>
                </titleStmt>
                <editionStmt>
                    <edition n="1.0"/>
                </editionStmt>
                <publicationStmt>
                    <authority>Traditional Chinese Architecture Digital Research Tool</authority>
                    <idno><xsl:value-of select="$record-id"/></idno>
                    <availability>
                        <licence target="http://creativecommons.org/licenses/by/3.0/">
                            <p>Distributed under a Creative Commons Attribution 3.0 Unported License.</p>
                        </licence>
                    </availability>
                    <date>
                        <xsl:value-of select="current-date()"/>
                    </date>
                </publicationStmt>
                <sourceDesc>
                    <p>Born digital.</p>
                </sourceDesc>
            </fileDesc>
            <!--
            <encodingDesc>
                <editorialDecl>
                    <p>This record created following the LOGAR guidelines. 
                        Documentation available at: <ref target="http://logarandes.org/documentation">http://logarandes.org/documentation</ref>.</p>
                </editorialDecl>
            </encodingDesc>
            -->
            <revisionDesc>
                <change n="1.0"><xsl:attribute name="when" select="current-date()"/>CREATED: place record</change>
            </revisionDesc>
        </teiHeader>
    </xsl:template>
</xsl:stylesheet>